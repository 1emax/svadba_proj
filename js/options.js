//

var serv = 'http://api.speedchat.com.ua/',
    lp = [],
    fLogin = $('#fLogin'),
    btnExit = $('#btnExit'),
    help = $('#help'),
    loginText = $('#loginText'),
    menu = $('#menu');

function setLoginText() {
    if (lp)
        for (var i in lp)
            if (lp[i].name == 'm') loginText.text(lp[i].value);
}

function login() {
    var arr = jQuery.extend([], lp);
    arr.push({
        name: 'a',
        value: 'active'
    });
    $.post(serv + 'ext/', arr, function(d) {
        if (d.error) alert(d.error);
        if (d.act == 1) {
            var n = {};
            n['lp'] = lp;
            chrome.storage.sync.set(n, function() {
                setLoginText();
                fLogin.parent().remove();
                menu.removeClass('hidden');
            });
        } else chrome.storage.sync.remove('lp');
    }, 'json').fail(function() {
        help.text(ll.serverConnError);
    });
}
$(function() {
    fLogin.submit(function(event) {
        event.preventDefault();
        lp = fLogin.serializeArray();
        login();
    });
    btnExit.click(function() {
        chrome.storage.sync.remove('lp');
        location.reload();
    });
    chrome.storage.sync.get('lp', function(d) {
        if (!d['lp']) {
            fLogin.parent().removeClass('hidden');
            help.removeClass('hidden');
        } else {
            lp = d['lp'];
            login();
        }
    });
});