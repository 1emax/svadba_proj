//
//
//
//


function inBack(tabId, cmd, h, f_back) {
    h.cmd = cmd;
    chrome.tabs.sendMessage(tabId, h, f_back);
}

function getUrlArg(url) {
    if (url.match(/www\.svadba\.com\/chat/) && !url.match(/m\.svadba\.com/)) return {
        sid: 1,
        type: 'chat'
    };
    else if (url.match(/dream\-marriage\.com/) && !url.match(/dream\-marriage\.com\/chat/) && !url.match(/dream\-marriage\.com\/adm/) && !url.match(/dream\-marriage\.com\/members\/options\.php/)) return {
        sid: 2,
        type: 'mail'
    };
    else if (url.match(/dream\-marriage\.com\/chat/)) return {
        sid: 2,
        type: 'chat'
    };
    else if (url.match(/zolushka\.net\/im/)) return {
        sid: 3,
        type: 'chat'
    };
    else if (url.match(/zolushka\.net\/myhome\//)) return {
        sid: 3,
        type: 'mail'
    };
    else if (url.match(/top\-dates\.net\/Finances\/Dues.aspx/) || url.match(/top\-dates\.ru\/Finances\/Dues.aspx/)) return {
        sid: 1,
        type: 'fin'
    };
    else if (url.match(/jump4love\.com\/chat_v2\//)) return {
        sid: 4,
        type: 'chat'
    };
    else if (url.match(/jump4love\.com\/search\.love\?action=result&/)) return {
        sid: 4,
        type: 'mail'
    };
    else if (url.match(/romancecompass\.com\/chat\//)) return {
        sid: 5,
        type: 'chat'
    };
    else if (url.match(/romancecompass\.com\/search\/results\//)) return {
        sid: 5,
        type: 'mail'
    };
    else if (url.match(/natashaclub\.com\/search_result\.php/)) return {
        sid: 6,
        type: 'mail'
    };
    else if (url.match(/hanuma\.ru\/cgi-bin\/user\/men_search\.cgi/)) return {
        sid: 7,
        type: 'mail'
    };
}

function hidePopup(tabId) {
    chrome.pageAction.hide(tabId);
}

function showPopup(tabId, is_adm) {
    var page = is_adm ? 'popup_adm.html' : 'popup.html';
    chrome.pageAction.show(tabId);
    chrome.pageAction.setPopup({
        tabId: tabId,
        popup: 'html/' + page
    });
}

function checkLogin(sid, cb) {
    chrome.tabs.query({
        lastFocusedWindow: true,
        active: true
    }, function(tab) {
        tab = tab[0];
        inBack(tab.id, 'checkLogin', {
            sid: sid
        }, function(data) {
            if (data && data.v && cb) cb();
        });
    });
};
chrome.notifications.onClicked.addListener(function(notID) {
    chrome.tabs.update(parseInt(notID.split('_')[1]), {
        selected: true
    });
});

function createNotif(tabId, title, text, img) {
    var id = 'id_' + tabId;
    chrome.notifications.create(id, {
        type: 'basic',
        title: title,
        message: text || '',
        iconUrl: img || 'images/heart2.png',
        priority: 2
    }, function(c) {});
    setTimeout(function() {
        chrome.notifications.clear(id, function(c) {});
    }, 3000);
}

function showNotif(tabId, title, text, img, hard) {
    if (hard) createNotif(tabId, title, text, img);
    else chrome.tabs.query({
        lastFocusedWindow: true,
        active: true
    }, function(tab) {
        tab = tab[0];
        if (tab.id != tabId) createNotif(tabId, title, text, img);
    });
};

function unique(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
}

function saveOptions(opt) {
    chrome.tabs.query({
        lastFocusedWindow: true,
        active: true
    }, function(tab) {
        tab = tab[0];
        inBack(tab.id, 'get', {}, function(data) {
            if (!data || !data.sid) return;
            var sname = data.sid + '_' + data.type + '_' + data.login;
            if (!opt[sname]['black']) opt[sname]['black'] = [];
            if (data.newBlack) opt[sname]['black'] = opt[sname]['black'].concat(data.newBlack);
            opt[sname]['black'] = unique(opt[sname]['black']);
            if (data.onlyNew) opt[sname]['onlyNew'] = data.onlyNew;
            chrome.storage.local.set(opt);
            chrome.tabs.sendMessage(tab.id, {
                cmd: 'get_options'
            });
        });
    });
};
var sr = '//api.speedchat.com.ua/js/';
var p = document.createElement('audio');
p.id = 'sound';
p.src = 'audio/i.wav';
chrome.extension.onMessage.addListener(function(request, sender, f_callback) {
    switch (request.cmd) {
        case 'notif':
            showNotif(sender.tab.id, request.data.title, request.data.text, request.data.img, request.hard);
            break;
        case 'url':
            var par = getUrlArg(sender.tab.url);
            if (par) f_callback({
                url: sr + par.sid + '_' + par.type[0] + '/',
                par: par
            });
            break;
        case 'insertCSS':
            chrome.tabs.insertCSS(sender.tab.id, request.data);
            break;
        case 'sound':
            p.play();
            break;
        case 'setStatus':
            chrome.pageAction.setTitle({
                tabId: sender.tab.id,
                title: 'SpeedChat' + (request.data ? ': ' + request.data : '')
            });
            break;
        case 'showPopupAdm':
            showPopup(sender.tab.id, true);
            break;
        case 'showPopup':
            showPopup(sender.tab.id);
            break;
        case 'hidePopup':
            hidePopup(sender.tab.id);
            break;
        case 'xhr':
            var xhr = new XMLHttpRequest();
            xhr.open("GET", 'http:' + request.url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        f_callback({
                            done: true,
                            text: xhr.responseText
                        });
                    } else {
                        f_callback({
                            done: false
                        });
                    }
                }
            };
            xhr.send();
            return true;
            break;
    }
});
var url_td = '';
var url_api = 'http://stat.speedchat.com.ua/api/';
var url_td_net = 'http://top-dates.net/';
var url_td_ru = 'http://top-dates.ru/';
var url_td_fin = 'Finances/Dues.aspx';
var servData = {};
var endId = false;

function canGetNextPage(page) {
    return !$(page).find('input[id$="ibNext"]').attr('disabled');
}

function parsePage(page) {
    $(page).find('.brdGray .item').each(function(k, v) {
        var dom = $(v);
        var oper_br = dom.find('td[id$="tdOperator"]').text().split('\\');
        var date = dom.find('td[id$="tdDate"]').text().split('-');
        var normdate = date[2] + '-' + date[1] + '-' + date[0];
        var id = dom.find('td[id$="tdNumber"]').text();
        if (id == '-') return;
        servData[id] = {
            type: dom.find('img').attr('title'),
            date: normdate,
            girl_id: dom.find('td>a[id$="aGirlId"]').text(),
            oper: oper_br[1],
            branch: oper_br[0],
            man: dom.find('td[id$="tdReason"]>a').text() || null,
            sum: parseFloat(dom.find('td[id$="tdSum"]').text())
        };
    });
}

function needStop(page, endId) {
    console.log('try needStop');
    return !canGetNextPage(page) || (endId && $(page).find('td[id$="_tdNumber"]').filter(function(k, v) {
        return $(v).text() == endId;
    }).length != 0);
}

function getStopNum(cb) {
    chrome.storage.sync.get('lp', function(d) {
        if (!d || !d['lp']) return;
        d['lp'].push({
            'name': 'a',
            value: 'end'
        });
        $.post(url_api, d['lp'], function(z) {
            console.log('endID is ', z);
            endId = z;
            endId = '1837335286';
            if (cb) cb();
        });
    });
}

function checkTDLogin(url, cb, err) {
    $.get(url).done(function(data) {
        var logined = $(data).find('#ctl00_ContentPlaceHolder1_txtBoxLogin').length == 0;
        console.log('logined', logined);
        if (cb && logined) return cb();
        else if (err) err();
    }).fail(function(xhr, status) {
        console.log(xhr, status);
        if (err) err();
    });
}

function notifBadTDlogin(tab) {
    createNotif(tab.id, 'SpeedStat', ll.badTDLogin);
}

function checkTDdomain(cb) {
    checkTDLogin(url_td_net, function() {
        url_td = url_td_net;
        if (cb) cb();
    }, function() {
        checkTDLogin(url_td_ru, function() {
            url_td = url_td_ru;
            if (cb) cb();
        }, function() {
            chrome.tabs.query({
                url: ["*://*.top-dates.net/*", "*://*.top-dates.ru/*"]
            }, function(tab) {
                if (!tab[0]) {
                    chrome.tabs.create({
                        url: url_td_net,
                        active: true
                    }, function(tab) {
                        notifBadTDlogin(tab);
                    });
                } else notifBadTDlogin(tab[0]);
            });
        });
    });
}

function getForm(page) {
    return {
        __CSRFTOKEN: $(page).find('#__CSRFTOKEN').val(),
        __EVENTTARGET: $(page).find('#__EVENTTARGET').val(),
        __EVENTARGUMENT: $(page).find('#__EVENTARGUMENT').val(),
        __LASTFOCUS: $(page).find('#__LASTFOCUS').val(),
        __VIEWSTATE: $(page).find('#__VIEWSTATE').val(),
        ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$hidSid: $(page).find('#ctl00_ctl00_ContentPlaceHolder1_nestedContentPlaceHolder_hidSid').val(),
        hidIsDataChanged: $(page).find('#hidIsDataChanged').val(),
        ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$hdnSelectedOperator: $(page).find('#ctl00_ctl00_ContentPlaceHolder1_nestedContentPlaceHolder_hdnSelectedOperator').val(),
        ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$cntErrorMessage$hdnErr: $(page).find('#ctl00_ctl00_ContentPlaceHolder1_nestedContentPlaceHolder_cntErrorMessage_hdnErr').val(),
        ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$selDays: $(page).find('#ctl00_ctl00_ContentPlaceHolder1_nestedContentPlaceHolder_selDays ').val(),
        ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$selMonths: $(page).find('#ctl00_ctl00_ContentPlaceHolder1_nestedContentPlaceHolder_selMonths ').val(),
        ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$selYears: $(page).find('#ctl00_ctl00_ContentPlaceHolder1_nestedContentPlaceHolder_selYears ').val(),
        ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$selBranches: $(page).find('#ctl00_ctl00_ContentPlaceHolder1_nestedContentPlaceHolder_selBranches ').val(),
        ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$drpDwnLstDueType: $(page).find('#ctl00_ctl00_ContentPlaceHolder1_nestedContentPlaceHolder_drpDwnLstDueType').val(),
        ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$cntPageNavigation$hidPageCount: $(page).find('#ctl00_ctl00_ContentPlaceHolder1_nestedContentPlaceHolder_cntPageNavigation_hidPageCount').val(),
        ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$cntPageNavigation$inpCurrentPage: $(page).find('#ctl00_ctl00_ContentPlaceHolder1_nestedContentPlaceHolder_cntPageNavigation_inpCurrentPage').val(),
        'ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$cntPageNavigation$ibNext.x': Math.floor(Math.random() * 16),
        'ctl00$ctl00$ContentPlaceHolder1$nestedContentPlaceHolder$cntPageNavigation$ibNext.y': Math.floor(Math.random() * 5)
    }
}

function getPayments() {
    getStopNum(function() {
        $.get(url_td + url_td_fin).done(function(page) {
            parsePage(page);
            var stop = needStop(page, endId);
            if (stop) return sendToServer();
            else postTDpage(page);
        }).fail(function(xhr, status) {
            console.log(xhr, status);
        });
    });
}

function postTDpage(page) {
    $.post(url_td + url_td_fin, getForm(page)).done(function(page) {
        parsePage(page);
        var stop = needStop(page, endId);
        if (stop) return sendToServer();
        else postTDpage(page);
    }).fail(function(xhr, status) {
        console.log(xhr, status);
    });
}

function sendToServer() {
    if (Object.keys(servData).length < 1) return;
    console.log(servData);
    chrome.storage.sync.get('lp', function(d) {
        if (!d || !d['lp']) return;
        d['lp'].push({
            'name': 'a',
            value: 'put'
        });
        d['lp'].push({
            'name': 'json',
            value: JSON.stringify(servData)
        });
        $.post(url_api, d['lp'], eval);
    });
}

function startParse() {
    checkTDdomain(function() {
        getPayments();
    })
}