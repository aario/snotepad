(function($) {
    let confirmExit = (callback) => {
        callback(true)
    }

    window.lunchPage = (page) => {
        console.log("lunchPage function called: " + page);

        const title = page[0].toUpperCase() + page.slice(1)
        window.setNavBar('navbar-page', {'title': title});

        window.setPage(page, {});

        window.hideSidebar()
        window.historyPush(
            window.lunchPage,
            [page],
            confirmExit
        )
    }
})(jQuery); // End of use strict

