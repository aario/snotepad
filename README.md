# SNotepad
SNotePad offers an effortless way to capture your thoughts with a simple Markdown editor, uniquely saving your notes directly as standard files on your phone, giving you full control to easily manage, back up, and share them anytime, anywhere, without being locked into a proprietary database.

<a href="https://f-droid.org/packages/info.aario.snotepad/" target="_blank">
<img src="https://f-droid.org/badge/get-it-on.png" alt="Get it on F-Droid" height="80"/></a>

<img src='screenshots/Screenshot_20250424-103842_SNotePad.jpg.png?raw=true'> <img src='screenshots/Screenshot_20250424-103801_SNotePad.jpg.png?raw=true'><br/>
<img src='screenshots/Screenshot_20250424-103751_SNotePad.jpg.png?raw=true'> <img src='screenshots/Screenshot_20250424-104348_SNotePad.jpg.png?raw=true'><br/>
<img src='screenshots/Screenshot_20250424-104555_SNotePad.jpg.png?raw=true'>

Copyright (C) 2025 Aario Shahbany

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,	but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see [<http://www.gnu.org/licenses/>](http://www.gnu.org/licenses/).

# About SNotepad
SOkay, here is the description formatted with Markdown headers:

## Simple Yet Powerful

SNotePad is designed for anyone who loves simplicity but needs more power than a basic notepad. It provides a clean, focused writing environment using the intuitive **Markdown format**, allowing you to easily structure your thoughts, create lists, emphasize text, and more, without complex menus. Whether you're jotting down quick ideas, drafting longer articles, or keeping track of important information, *SNotePad* makes the process smooth and efficient.

## Organize and Find with Ease

Beyond simple note creation, *SNotePad* offers robust organization features. Group your notes into **folders** that make sense to you, keeping your workspace tidy and your information easy to locate. Finding specific notes is a breeze with built-in **search capabilities** that quickly scan through your file contents, and you can **sort** your files by name or date to always have the most relevant information at your fingertips. Customization options, like choosing between light and dark **themes**, let you tailor the app to your preference.

## Your Notes, Your Files, Your Control

What truly sets *SNotePad* apart is how it respects your ownership of your data. Unlike many apps that lock your notes away in internal databases or proprietary formats, *SNotePad* saves every note directly as **standard files on your phone's storage**. This means *you* are in full control. You can easily access, copy, move, back up using your favorite tools, share your notes via any app, or even edit them with other software – they are *your files*, accessible and portable, just like any other document on your device.

## Try SNotePad Today

If you're looking for a straightforward yet capable note-taking app that puts you in charge of your notes, give *SNotePad* a try. Enjoy the ease of Markdown editing combined with the freedom and flexibility of direct file access for a truly empowering note-taking experience.
	
# Features
Here is a list of features found in the SNotePad application, based on the provided Javascript files:

## Markdown Editor

Provides a rich text editing experience using the EasyMDE library, allowing users to format notes with Markdown syntax for headings, lists, bold, italics, links, code blocks, quotes, and more.

## Direct File Storage

Notes are saved directly as individual files (likely `.md` or plain text) onto the user's phone storage, giving full control over the files for backup, sharing, or use with other applications.

## Folder Organization

Users can add multiple folders from their device storage to organize notes within the app. The sidebar displays these added folders for quick navigation.

## File Listing & Sorting

Within a selected folder, the app displays a list of note files, showing the filename and modification date. Users can sort this list by filename (A-Z or Z-A) or by date (newest or oldest first).

## File Search (Folder View)

A search bar allows users to quickly find notes within the currently viewed folder. The search likely includes filenames and file content, utilizing fuzzy search (Fuse.js) for flexible matching.

## Text Search (Editor View)

While editing a note, users can search for specific text within that note. Matches are highlighted.

## File Creation, Saving & Renaming

Users can create new notes within a chosen folder. Changes can be saved, and both new and existing files can be named or renamed via the editor's filename input field.

## File Deletion

Notes can be permanently deleted from the device storage directly through the folder view interface, with a confirmation step.

## Theme Customization

The application supports Light, Dark, and Auto (system preference) themes for user interface customization.

## Responsive Sidebar

A sidebar displays the user-added folders for navigation. It can be toggled on smaller screens.

## Image Handling

Supports inserting images into notes. Includes functionality for uploading images (likely via drag/drop or paste, interacting with the Android backend) and potentially handling image previews within the editor.

## Editor Toolbar

A toolbar provides quick access buttons for common Markdown formatting actions like bold, italic, headings, lists, quotes, code blocks, links, images, tables, horizontal rules, and undo/redo.

## Preview Mode

Users can toggle a preview mode to see how their Markdown notes will be rendered as formatted text.

## Side-by-Side View

Offers a split-screen view showing the Markdown source code alongside its live preview.

## Fullscreen Mode

Allows toggling a distraction-free fullscreen mode for either the editor or the preview.

## Clean Block Formatting

A toolbar action is available to remove Markdown formatting from a selected block of text.

## User Feedback & Controls

Provides user feedback through toasts for actions like saving or errors and uses confirmation modals for destructive actions like deleting files. Loading indicators inform the user during operations. Includes back-button navigation history management.

## Android Integration

The web frontend communicates with a native Android layer (`AndroidInterface`) to perform file system operations, manage preferences, and potentially handle other device interactions.

# Development

User interface part of this app is done via html5 and javascript.
Heavy usage of jquery, bootstrap 5 and SB Admin 2

## Web Assets

Web Asset source files are in html folder. After you compiled them, they get copied over to:
```
../app/src/main/assets
```
To faster develop and test the web asset files locally, open ../app/src/main/assets/index.html file in a browser wiht `?debug=true`.

### Compile

To compile web assets, run `build-assets.sh` It will compile them inside a docker container. To build the docker container refer to Build the Compile Container Section

## Build the Compile Container Section

Inside project root, run:

```
docker build -t wsn-builder .
```
## Acknowledgements / Credits

> aario.info - SNotePad HTML v1.0.0
> (Based on [Start Bootstrap SB Admin 2 Theme](https://startbootstrap.com/theme/sb-admin-2))
> Copyright 2025-2025 Aario Shahbany

This application utilizes several excellent open-source libraries, including:

* [jQuery](https://jquery.com/) (License: MIT)
* [Bootstrap](https://getbootstrap.com/) (License: MIT)
* [EasyMDE](https://github.com/Ionaru/easy-markdown-editor) (License: MIT)
* [Hammer.JS](https://hammerjs.github.io/) (License: MIT)
* [Fuse.js](https://fusejs.io/) (License: Apache 2.0)
* [SortableJS](https://sortablejs.github.io/Sortable/) (License: MIT)
* [CodeMirror](https://codemirror.net/) (License: MIT)
* [CodeMirror Spell Checker](https://github.com/sparksuite/codemirror-spell-checker) (License: MIT)
* [Marked](https://marked.js.org/) (License: MIT)
* [Typo.js](https://github.com/cfinke/Typo.js) (License: MIT-style)
* [Font Awesome](https://fontawesome.com/) (License: CC BY 4.0, SIL OFL 1.1, MIT)
* [jQuery Easing](https://github.com/jquery/jquery-easing) (License: BSD)
* _(Others may be included in bundled dependencies)_

The SNotePad application code itself is licensed under the GNU General Public License

```text
GPL v3 License

Copyright (c) 2025 Aario Shahbany

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
```

It takes a lot of time and effort to write a software. If you found SNotepad usefull, please consider becoming a sponsor by clicking below button:

[![donation](https://img.shields.io/badge/Sponsor-%231EAEDB.svg?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/aario)

Thanks in advance.
