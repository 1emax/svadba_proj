function validateEmail(email) {
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    return re.test(email);
}

function validateUrl(url) {
    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/
    return urlPattern.test(url);
}

function convertDate(inputFormat) {
    var d = new Date(inputFormat);
    var month = (d.getMonth() + 1) + '';
    if (month.length == 1) {
        month = '0' + month;
    }
    var minutes = (d.getMinutes() + 1) + '';
    if (minutes.length == 1) {
        minutes = '0' + minutes;
    }
    return d.getHours() + ':' + minutes + ' ' + [d.getDate(), month, d.getFullYear()].join('.');
}

function genAge() {
    var age = '';
    for (var i = 18; i <= 90; i++) age += '<option value="' + i + '">' + i + '</option>';
    return age;
}

function genSpeed() {
    var speed = '';
    var speed_arr = [1, 2, 5, 10, 15, 20];
    for (var key in speed_arr) speed += '<option value="' + speed_arr[key] + '">' + speed_arr[key] + '</option>';
    return speed;
}

function phraseHtml(val) {
    return '<div class="list col-lg-12">' + '<div class="input-group">' + '<input name="phrases" type="text" class="form-control" value="' + val + '">' + '<span class="input-group-btn">' + '<button class="btn btn-danger phraseDel" type="button">&times;</button>' + '</span>' + '</div>' + '</div>';
}

function mailHtml(val) {
    return '<option>' + val + '</option>';
}

function blackImage(id) {
    switch (sid) {
        case 1:
            return 'http://www.svadba.com/Images/Man/' + id + '_1.jpg';
            break;
        case 2:
            return 'http://dream-marriage-profilephotos.s3.amazonaws.com/im' + id + '_small.jpg';
            break;
        case 3:
            return 'http://www.zolushka.net/lb_photos/' + id + '/' + id + '_tn.jpg';
            break;
        case 4: 
        	$.post('http://jump4love.com/chat_v2/',{
            	'ajax':1,
            	'mod':'users',
            	'file':'one',
            	'id':id},
            	function(d){
            		if(!d||!d.result||d.result!='ok')return;
            		$("#BlackList .user_id[value='"+id+"']").parent().removeClass('notImg ').prepend('<img width = "50" height = "66" src = "http://jump4love.com'+d.user.img_sml+'">');},
            		'json ');
            break;
            case 5:$.ajax({
            	url:'http: //romancecompass.com/chat/',
            	type:'POST',
            	data:{
            		'ajax':1,
            		'action':'get_contact_customer',
            		'c_id':id
            	},
            	dataType:'json',
            	cache:true,
            	success:function(d){
            		if(!d||!d.result||d.result!='ok')return;
            		$("#BlackList .user_id[value='"+id+"']").parent().removeClass('notImg').prepend('<img width="50" height="66" src="http://romancecompass.com'+(d.customer.photo_m_src||'/templates/templ2/images/nophoto_mid.jpg')+'">');
            	}
            });
            break;
        }
    return '';
}

function blackHtml(val){
	var blackImg=blackImage(val);
	if(blackImg=='')return '<div class="list blackList notImg">'+'<input name="black" type="text" class="user_id" readonly value="'+val+'">'+'<span class="blackDel btnDel">&times;</span>'+'</div>';
	else return '<div class="list blackList">' + '<img width="50" height="66" src="' + blackImage(val) + '">' + '<input name="black" type="text" class="user_id" readonly value="' + val + '">' + '<span class="blackDel btnDel">&times;</span>' + '</div>';
}

function getHtml(type, val) {
    switch (type) {
        case 'mails':
            return mailHtml(val.n);
            break;
        case 'phrases':
            return phraseHtml(val);
            break;
        case 'black':
            return blackHtml(val);
            break;
    }
}

function loadSettings() {
    chrome.storage.local.get(sname, function(d) {
        $.extend(options, d[sname]);
        setSettings(options);
    });
}

function setSettings(d) {
    if (d == undefined) age_to.val(90);
    if (d.speed) speed.val(d.speed);
    if (d.age_from) age_from.val(d.age_from);
    if (d.age_to) age_to.val(d.age_to);
    if (d.sendTarget) sendTarget.val(d.sendTarget);
    if (d.shistory == "") shistory.checkbox('check');
    if (d.ustart == "") ustart.checkbox('check');
    if (d.translate == "") translate.checkbox('check');
    if (d.dblWrite == "") dblWrite.checkbox('check');
    if (d.nsound == "") nsound.checkbox('check');
    if (d.show == "") show.checkbox('check');
    if (d.autoBlack == "") autoBlack.checkbox('check');
    if (d.autoNew == "") autoNew.checkbox('check');
    if (d.withPhoto == "") withPhoto.checkbox('check');
    if (d.vip == "") vip.checkbox('check');
    if (d.noname) noname.val(d.noname);
    if (d.onlyNew) onlyNew = d.onlyNew;
    var lists = {
        mails: '',
        phrases: '',
        black: ''
    };
    $.each(d, function(k, v) {
        if (k == 'phrases' || k == 'black' || k == 'mails') {
            if (typeof v == 'string') v = [v];
            $.each(v, function(sk, sv) {
                lists[k] += getHtml(k, sv);
            });
        }
    });
    mails = d.mails;
    $('#mailList option[value!="-1"]').remove();
    $('#mailList').append(lists.mails);
    $('#PhraseList').html(lists.phrases);
    $('#BlackList').html(lists.black);
    delInit();
}

function getOptions() {
    var obj = $('#fSetting').serializeObject();
    if (obj.black != undefined && typeof obj.black == 'string') obj.black = [obj.black];
    if (type == 'm') {
        obj.mails = mails;
    } else {
        if (obj.phrases != undefined && typeof obj.phrases == 'string') obj.phrases = [obj.phrases];
    }
    if (onlyNew && Object.keys(onlyNew).length > 0) obj.onlyNew = onlyNew;
    return obj;
}

function saveOptions(cb) {
    if (sname == '') return;
    var n = {};
    n[sname] = getOptions();
    if (cb) chrome.storage.local.set(n, cb);
    else chrome.storage.local.set(n);
    return n;
}

function delInit() {
    $('.btnDel, .phraseDel').click(function() {
        $(this).parents('.list').remove();
    });
}
var background = chrome.extension.getBackgroundPage();
addEventListener('unload', function(event) {
    background.saveOptions(saveOptions());
}, true);

var sid = 0,
    type = '',
    login = '',
    options = {
        phrases: [],
        mails: [],
        black: []
    },
    status = '',
    btn = '',
    sname = '',
    toDate, speed = $('#iSpeed'),
    age_from = $('#iAgeFrom'),
    age_to = $('#iAgeTo'),
    shistory = $('#iShistory'),
    ustart = $('#iUstart'),
    translate = $('#iTranslate'),
    dblWrite = $('#iDblWrite'),
    nsound = $('#iSound'),
    show = $('#iShow'),
    noname = $('#iNoname'),
    autoBlack = $('#iAutoBlack'),
    autoNew = $('#iAutoNew'),
    withPhoto = $('#iWithPhoto'),
    vip = $('#iVip'),
    sendTarget = $('#sendTarget'),
    btnSetSave = $('#btnSetSave'),
    btnSetLoad = $('#btnSetLoad'),
    mailSave = $('#mailSave'),
    mailDel = $('#mailDel'),
    mailTheme = $('#mailTheme'),
    mailList = $('#mailList'),
    mailVal = $('#mailVal'),
    photo = $("#mailPhoto"),
    photos = $('#Photos'),
    files = {},
    mails = [],
    onlyNew = {},
    btnStart = $('#btnStart');
$('.edtVal').keypress(function(e) {
    if (e.which == 13) {
        $(this).parent().find('.btn').trigger('click');
        return false;
    }
});

function valMail() {
    if (mailTheme.val() == '') {
        $('#status').text(ll.enterMailTheme);
        return false;
    }
    if (mailVal.val() == '') {
        $('#status').text(ll.enterMailText);
        return false;
    }
    if (validateEmail(mailVal.val()) || validateUrl(mailVal.val())) {
        $('#status').text(ll.enterNotValid);
        return false;
    }
    return true;
}

mailSave.click(function() {
    var selected = mailList.find(':selected');
    if (selected.val() == '-1') {
        if (!valMail()) return;
        if (mailList.find(':contains("' + mailTheme.val() + '")').length != 0) {
            $('#status').text(ll.enterMailClone);
            return;
        }
        mails.push({
            n: mailTheme.val(),
            t: mailVal.val()
        });
        mailList.append(mailHtml(mailTheme.val()));
        mailList.val(mailTheme.val());
        $('#status').text(ll.enterMailAdd);
    } else {
        var selected = mailList.find(':selected');
        if (!valMail()) return;
        if (selected.text() != mailTheme.val() && mailList.find(':contains("' + mailTheme.val() + '")').length != 0) {
            $('#status').text(ll.enterMailClone);
            return;
        }
        selected.text(mailTheme.val());
        mails[mailList.prop('selectedIndex') - 1] = {
            n: mailTheme.val(),
            t: mailVal.val()
        };
        $('#status').text(ll.enterMailEdit);
    }
});
mailDel.click(function() {
    var selected = mailList.find(':selected');
    if (selected.val() != '-1') {
        mails.splice(mailList.prop('selectedIndex') - 1, 1);
        selected.remove();
        mailTheme.val('');
        mailVal.val('');
        mailList.val('-1');
    }
});
mailList.change(function() {
    var selected = mailList.find(':selected');
    if (selected.val() != '-1') {
        var m = mails[mailList.prop('selectedIndex') - 1];
        mailTheme.val(m.n);
        mailVal.val(m.t);
    } else {
        mailTheme.val('');
        mailVal.val('');
    }
});
$('.btnAdd').click(function() {
    var inp = $(this).parents('.input-group').find('input');
    var val = inp.val();
    if (val == '') return;
    if ($(inp).attr('id') == 'phraseVal' && (validateEmail(val) || validateUrl(val))) {
        $('#status').text(ll.enterNotValid);
        return;
    }
    $(this).parents('.panel-body').find('.allList').append(getHtml(this.id.slice(0, -3), inp.val()));
    delInit();
    inp.val('');
});
age_from.html(genAge());
age_to.html(genAge());
age_to.val(90);
speed.html(genSpeed());
btnStart.click(function() {
    saveOptions(function() {
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendMessage(tab.id, {
                cmd: 'btn'
            });
            if (Object.keys(files).length > 0) chrome.tabs.sendMessage(tab.id, {
                cmd: 'photos',
                photos: files
            });
        });
    });
});
var seltab;
if (chrome && chrome.tabs) {
    chrome.tabs.getSelected(null, function(tab) {
        seltab = tab.id;
        chrome.tabs.sendMessage(tab.id, {
            cmd: 'get'
        }, function(data) {
            sid = data.sid;
            type = data.type;
            login = data.login;
            status = data.status;
            toDate = data.toDate;
            btn = data.btn || ll.sendStart;
            if (data.dataPhoto && Object.keys(data.dataPhoto).length > 0) {
                for (var i in data.dataPhoto) addImage(i, data.dataPhoto[i]);
            }
            sname = sid + '_' + type + '_' + login;
            $('#status').text(status || ll.statusDef[type]);
            $('#btnStart').text(btn);
            $('#login').text(sid + ':' + type + ':' + login);
            $('#toDate').attr('href', 'http://speedchat.com.ua/#donate#' + sid + ':' + type + ':' + login);
            if (!toDate || toDate == 0) {
                $('#fSetting, #status').remove();
                $('#toDate').text(ll.notActive);
            } else $('#toDate').text(convertDate(toDate));
            if (typeof data.sendTargets !== 'undefined' && data.sendTargets.length != 0) {
                var opt = '';
                for (var i in data.sendTargets) opt += '<option value="' + i + '">' + data.sendTargets[i] + '</option>'
                sendTarget.removeClass('hidden').html(opt);
            }
            if (typeof data.popupOn !== 'undefined' && data.popupOn.length != 0) {
                $.each(data.popupOn, function(k, v) {
                    $('#' + v).removeClass('hidden');
                });
                $('#initH').remove();
                loadSettings();
            } else {
                $('#fSetting, #status').remove();
            }
        });
    });
    chrome.extension.onMessage.addListener(function(request, sender, cb) {
        if (!seltab || seltab != sender.tab.id) return;
        switch (request.cmd) {
            case 'setStatus':
                status = request.data;
                $('#status').text(status || ll.statusDef[type]);
                break;
            case 'setBtn':
                btn = request.data || ll.sendStart;
                $('#btnStart').text(btn);
                break;
            case 'reloadSet':
                loadSettings();
                break;
        }
    });
}
btnSetSave.click(function() {
    chrome.tabs.getSelected(null, function(tab) {
        saveOptions(function() {
            chrome.tabs.sendMessage(tab.id, {
                cmd: 'save_options'
            });
        });
    });
});
btnSetLoad.click(function() {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {
            cmd: 'load_options'
        });
    });
});
window.oncontextmenu = function() {
    return false;
};

function sendPhotos() {
    chrome.tabs.getSelected(null, function(tab) {
        if (Object.keys(files).length > 0) chrome.tabs.sendMessage(tab.id, {
            cmd: 'photos',
            photos: files
        });
    });
}

function addImage(name, dataUrl, isRemove) {
    var isRemove = isRemove || false;
    var img = new Image();
    img.onload = function() {
        $(img).css({
            height: '100px'
        }).prop('name', name);
        var div = jQuery('<div/>').addClass('photos');
        div.append(img);
        if (isRemove) {
            var remove = jQuery('<div class="btnDel">&times;</div>').css({
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: 'gray'
            }).click(function() {
                delete(img);
                delete(files[name]);
                $(this).parent().remove();
            });
            div.append(remove);
            files[name] = dataUrl;
        } else {
            div.addClass('unsel');
            div.click(function() {
                if ($(this).hasClass('unsel')) {
                    $(this).removeClass('unsel');
                    files[name] = dataUrl;
                } else {
                    div.addClass('unsel');
                    delete(files[name]);
                }
            });
        }
        photos.append(div);
    };
    img.src = dataUrl;
}

photo.fileReaderJS({
    accept: 'image/jpeg',
    on: {
        load: function(e, file) {
            addImage(file.name, e.target.result, true);
            $('#status').text(ll.photoLoad);
        },
        error: function() {
            $('#status').text(ll.photoError);
        },
        skip: function(file) {
            $('#status').text(file.why || ll.photoNotJpeg);
        },
        beforestart: function(file) {
            if (files[file.name] != undefined) {
                file.why = ll.photoClone;
                return false;
            }
            if (file.size > 2097152) {
                $('#status').text(ll.photoBig);
                return false;
            }
        }
    }
});


$('.istooltip').tooltip();