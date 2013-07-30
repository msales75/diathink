// keep a per-user history of reversible actions
diathink.HistoryModel = M.Model.create({
    __name__:'History',

    history_id:M.Model.attr('String', {
        isRequired:YES
    }),
    instance_id:M.Model.attr('String', {
        isRequired:YES
    }),
    user_id:M.Model.attr('String', {
        isRequired:YES
    }),
    timestamp:M.Model.attr('Number', {
        isRequired:YES
    }),
    action:M.Model.attr('String', {
        isRequired:YES
    }),
    object:M.Model.attr('String', {
        isRequired:YES
    }),
    argument:M.Model.attr('String', {
        isRequired:NO
    }),
    trigger:M.Model.attr('String', {
        isRequired:NO
    }),
    // history_id of command removing this undone-branch
    lost:M.Model.attr('String', {

    })

}, M.DataProviderLocalStorage);