(function($) {
    "use strict"; // Start of use strict
    const VERSION = 2

    const DEFAULT_VALUES = {
        'paths': {}
    }

    const DEBUG = (new URLSearchParams(window.location.search)).get('debug') === 'true'

    console.log('version', VERSION)

    setTimeout(() => {
            if (typeof AndroidInterface === 'undefined' && DEBUG === false) {
                window.showToast("Android interface not available. Probably I'm incompatible with your phone altogether :-(");
            }
        },
        1000
    )

    let callbacks = {}

    window.requestFolderSelection = () => {
        if (DEBUG) {
            let i = Math.floor(Math.random() * 9999) + 1
            window.requestFolderSelectionSuccess('/storage/path-to-folder-' + i + '/Folder ' + i)
            return
        }

        AndroidInterface.initiateFolderSelection();
    }

    window.requestFolderSelectionSuccess = (path) => {
        let paths = JSON.parse(window.readPreferences('paths'));
        if (paths === null) {
            paths = []
        }

        paths.push(path)

        window.writePreferences('paths', JSON.stringify(paths))
        window.uiUpdateFolders(paths)
    }

    window.requestScanFolder = (path, callback) => {
        callbacks['scanFolder' + path] = callback
        if (DEBUG) {
            let files = []
            const numberWords = [
                "", "one", "two", "three", "four", "five",
                "six", "seven", "eight", "nine", "ten"
            ];
            for (let i = 1; i <= 10; i++) {
                const filename = 'File ' + i
                const content = numberWords[i]
                const date = new Date(); // Gets the current date and time
                date.setDate(date.getDate() - i)
                files.push({
                    'filename': filename,
                    'content': content,
                    'date': date.toLocaleDateString()
                })
            }
            window.scanFolderCallback(path, JSON.stringify(files))

            return
        }

        AndroidInterface.initiateReadFolder(path, true)
    }

    window.scanFolderCallback = (path, folderContentJson, isError) => {
        callbacks['scanFolder' + path](path, JSON.parse(folderContentJson), isError)
        delete callbacks['scanFolder' + path]
    }

    window.releaseFolder = (path) => {
        const pathsJson = window.readPreferences('paths')
        let paths = JSON.parse(pathsJson);
        paths.splice(
            $.inArray(path, paths),
            1
        )
        if (!DEBUG) {
            AndroidInterface.releaseFolder(path);
        }

        window.writePreferences('paths', JSON.stringify(paths))
        window.uiUpdateFolders(paths)
    }

    window.deleteFile = (path) => {
        if (!DEBUG) {
            AndroidInterface.deleteFile(path);
        }
    }

    window.readPreferences = (key) => {
        result = window.localStorage.getItem(key)
        if (result === undefined) {
            result = DEFAULT_VALUES[key]
        }

        return result
    }

    window.writePreferences = (key, value) => {
        window.localStorage.setItem(key, value);
    }

    window.requestReadFolder = (path, callback) => {
        callbacks['readFolder' + path] = callback
        if (DEBUG) {
            let files = []
            for (let i = 1; i <= 10; i++) {
                const filename = 'File ' + i
                const date = new Date(); // Gets the current date and time
                date.setDate(date.getDate() - i)
                files.push({
                    'filename': filename,
                    'date': date.toLocaleDateString()
                })
            }
            window.readFolderCallback(path, JSON.stringify(files))

            return
        }

        AndroidInterface.initiateReadFolder(path, false)
    }

    window.readFolderCallback = (path, folderContentJson, isError) => {
        callbacks['readFolder' + path](path, JSON.parse(folderContentJson), isError)
        delete callbacks['readFolder' + path]
    }

    window.requestReadFile = (path, callback) => {
        callbacks['readFile' + path] = callback
        if (DEBUG) {
            let content = '# Sample Content\n\n *' + path + '*\n\n'
            for (let i = 1; i <= 30; i++) {
                content = content + '- Line ' + i + '\n'
            }
            
            window.readFileCallback(path, content)

            return
        }

        AndroidInterface.initiateReadFile(path)
    }

    window.readFileCallback = (path, fileContent, isError) => {
        callbacks['readFile' + path](path, fileContent, isError)
        delete callbacks['readFile' + path]
    }

    window.requestWriteFile = (path, fileContent, callback) => {
        callbacks['writeFile' + path] = callback
        if (DEBUG) {
            window.writeFileCallback(path, path)

            return
        }

        AndroidInterface.initiateWriteFile(path, fileContent)
    }

    window.writeFileCallback = (originalPath, path, isError) => {
        callbacks['writeFile' + originalPath](path, isError)
        delete callbacks['writeFile' + originalPath]
    }
})(jQuery); // End of use strict
