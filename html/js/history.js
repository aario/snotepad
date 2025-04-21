(function($) {
    "use strict"; // Start of use strict
    let history = []

    window.historyPush = (actionHandler, args) => {
        history.push({
            'actionHandler': actionHandler,
            'args': args
        })
    }

    window.handleBackPress = () => {
        //The last item in the history stack, is always the current action.
        //So there is no point if we repeat the same action
        //So we discard it here:
        history.pop()

        //Now we get to the action the user was doing before the current one:
        lastAction = history.pop()
        if (lastAction === undefined) {
            return
        }

        lastAction['actionHandler'](...lastAction['args'])
    }
})(jQuery); // End of use strict
