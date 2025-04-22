(function($) {
    "use strict"; // Start of use strict
    let history = []

    window.historyPush = (
        actionHandler,
        args,
        confirmExit
    ) => {
        history.push({
            'actionHandler': actionHandler,
            'args': args,
            'confirmExit': confirmExit
        })
        console.log('historyPush', history)
    }

    const confirmExitResultHandler = (allowed) => {
        console.log('confirmExitResultHandler', allowed, history)
        if (!allowed) {
            return
        }

        if (history.length < 2) {
            return //Nothing to go back to
        }

        //First pop the current action as we don't need it anymore
        history.pop()
        //Now we get to the action the user was doing before the current one:
        lastAction = history.pop()
        if (lastAction === undefined) {
            return
        }

        lastAction['actionHandler'](...lastAction['args'])
    }

    window.handleBackPress = () => {
        console.log('handleBackPress', history)
        //The last item in the history stack, is always the current action.
        const currentAction = history.at(-1)
        if (currentAction === undefined) {
            return
        }

        currentAction['confirmExit'](confirmExitResultHandler)
    }

    $("#btnBack").on('click', window.handleBackPress)
})(jQuery); // End of use strict
