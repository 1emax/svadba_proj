$(function() {
    var livechat = $('#cntrlMenu_hlLiveChat');
    if (livechat.length != 0) {
        livechat.attr('href', '//www.svadba.com/chat/');
        livechat.parents('dt').append('<br><a href="//www.svadba.com/chat/" class="letterTitleSmall">' + ll.svOpenChat + '</a><br><a href="//www.svadba.com/chat/" target="_blank" class="letterTitleSmall">' + ll.svOpenChatNew + '</a>')
    }
})