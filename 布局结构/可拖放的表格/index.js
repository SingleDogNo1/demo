var Sys = (function (ua) {
    var s = {};
    s.IE = ua.match(/msie ([\d.]+)/) ? true : false;
    s.Firefox = ua.match(/firefox\/([\d.]+)/) ? true : false;
    s.Chrome = ua.match(/chrome\/([\d.]+)/) ? true : false;
    s.IE6 = (s.IE && ([/MSIE (\d)\.0/i.exec(navigator.userAgent)][0][1] == 6)) ? true : false;
    s.IE7 = (s.IE && ([/MSIE (\d)\.0/i.exec(navigator.userAgent)][0][1] == 7)) ? true : false;
    s.IE8 = (s.IE && ([/MSIE (\d)\.0/i.exec(navigator.userAgent)][0][1] == 8)) ? true : false;
    return s;
})(navigator.userAgent.toLowerCase());

function $(Id) {
    return document.getElementById(Id);
};

function addListener(element, e, fn) {
    element.addEventListener ? element.addEventListener(e, fn, false) : element.attachEvent("on" + e, fn);
};

function removeListener(element, e, fn) {
    element.removeEventListener ? element.removeEventListener(e, fn, false) : element.detachEvent("on" + e, fn);
};
var Css = function (e, o) {
    if (typeof o == "string") {
        e.style.cssText = o;
        return;
    }
    for (var i in o)
        e.style[i] = o[i];
};
var Bind = function (object, fun) {
    var args = Array.prototype.slice.call(arguments).slice(2);
    return function () {
        return fun.apply(object, args);
    };
};
var BindAsEventListener = function (object, fun) {
    var args = Array.prototype.slice.call(arguments).slice(2);
    return function (event) {
        return fun.apply(object, [event || window.event].concat(args));
    };
};
var Extend = function (destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
    ;
};
var Class = function (properties) {
    var _class = function () {
        return (arguments[0] !== null && this.initialize && typeof(this.initialize) == 'function') ? this.initialize.apply(this, arguments) : this;
    };
    _class.prototype = properties;
    return _class;
};
var Table = new Class({
    initialize: function (tab, set) {
        this.table = tab;
        this.thead = tab.getElementsByTagName('thead')[0]; //常用的dom元素做成索引
        this.theadtds = this.thead.getElementsByTagName('td'); //
        this.rows = []; //里面tbodys记录所有tr的引用 这里用数组记录是因为数组有reverse方法,可以用来正序,反序
        this.clos = {}; //里面记录所有列元素的引用
        this.edits = {}; //编辑表格的规则和提示
        this.sortCol = null; //记录哪列正在排序中
        this.inputtd = null; //记录哪个input被编辑了
        this.closarg = {
            tdnum: null,
            totdnum: null,
            closmove: BindAsEventListener(this, this.closmove),
            closup: BindAsEventListener(this, this.closup)
        };//关于列拖拽的一些属性方法
        this.widtharg = {
            td: null,
            nexttd: null,
            x: 0,
            tdwidth: 0,
            nexttdwidth: 0,
            widthmove: BindAsEventListener(this, this.widthmove),
            widthup: BindAsEventListener(this, this.widthup)
        };
        var i = 0, j = 0, d = document, rows = tab.tBodies[0].rows,
            tds1 = tab.tBodies[0].getElementsByTagName('td'), edit = [];
        var divs = this.thead.getElementsByTagName('div');
        this.input = d.createElement('input'); //编辑用的input
        this.input.type = "text";
        this.input.className = 'edit';
        this.img = d.body.appendChild(d.createElement('div'));
        this.img.className = "cc";
        this.line = d.body.appendChild(d.createElement('div'));
        this.line.className = 'line';
        this.line.style.top = tab.offsetTop + "px";
        if (Sys.IE6) {
            this.checkbox = {}; //记录那些checkbox被选中了 处理ie6不兼容的问题
            var checkboxs = tab.getElementsByTagName('input'), k = 0;
            for (var lll = checkboxs.length; k < lll; k++)
                checkboxs[k].type == "checkbox" && addListener(checkboxs[k], "click", Bind(this, function (elm, k) {
                    elm.checked == true ? (this.checkbox[k] = elm) : (delete this.checkbox[k]);
                }, checkboxs[k], k));
        }
        ;
        for (var l = set.length; i < l; i++) {
            addListener(this.theadtds[set[i].id], 'click', Bind(this, this.sortTable, this.theadtds[set[i].id], set[i].id, set[i].type));
            set[i].edit && (this.edits[set[i].id] = {rule: set[i].edit.rule, message: set[i].edit.message});
        }
        ;
        for (l = rows.length; j < l; j++)
            this.rows[j] = rows[j];
        for (var k = 0, l = this.theadtds.length; k < l; k++) {
            this.clos[k] = [];
            this.theadtds[k].setAttribute('clos', k)
            addListener(this.theadtds[k], 'mousedown', BindAsEventListener(this, this.closdrag));
        }
        for (var i = 0, l = tds1.length; i < l; i++) {
            var p = i < this.theadtds.length - 1 ? i : i % this.theadtds.length;
            this.clos[p][this.clos[p].length] = tds1[i];
            this.edits[p] && tds1[i].setAttribute('edit', p);
        }
        for (var i = 0, l = divs.length; i < l; i++) {
            addListener(divs[i], 'mousedown', BindAsEventListener(this, this.widthdrag));
        }
        addListener(this.thead, 'mouseover', BindAsEventListener(this, this.theadhover));
        addListener(tab.tBodies[0], 'dblclick', BindAsEventListener(this, this.edit));
        addListener(this.input, 'blur', Bind(this, this.save, this.input));
    },
    theadhover: function (e) {
        e = e || window.event;
        var obj = e.srcElement || e.target;
        if (obj.nodeName.toLowerCase() == 'td')
            this.closarg.totdnum = (obj).getAttribute('clos');
        else if (obj.nodeName.toLowerCase() == 'div')
            obj.style.cursor = "sw-resize";
    },
    widthdrag: function (e) {
        if (Sys.IE) {
            e.cancelBubble = true
        } else {
            e.stopPropagation()
        }
        this.widtharg.x = e.clientX;
        this.widtharg.td = (e.srcElement || e.target).parentNode;
        if (Sys.IE) {
            this.widtharg.nexttd = this.widtharg.td.nextSibling;
        } else {
            this.widtharg.nexttd = this.widtharg.td.nextSibling.nextSibling;
        }
        this.widtharg.tdwidth = this.widtharg.td.offsetWidth;
        this.widtharg.nexttdwidth = this.widtharg.nexttd.offsetWidth;
        this.line.style.height = this.table.offsetHeight + "px";
        addListener(document, 'mousemove', this.widtharg.widthmove);
        addListener(document, 'mouseup', this.widtharg.widthup);
    },
    widthmove: function (e) {
        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        var x = e.clientX - this.widtharg.x, left = e.clientX, clientx = e.clientX;
        if (clientx < this.widtharg.x) {
            if (this.widtharg.x - clientx > this.widtharg.tdwidth - 35)
                left = this.widtharg.x - this.widtharg.tdwidth + 35;
        }
        if (clientx > this.widtharg.x) {
            if (clientx - this.widtharg.x > this.widtharg.nexttdwidth - 35)
                left = this.widtharg.x + this.widtharg.nexttdwidth - 35;
        }
        Css(this.line, {display: "block", left: left + "px"});
    },
    widthup: function (e) {
        this.line.style.display = "none";
        var x = parseInt(this.line.style.left) - this.widtharg.x;
        this.widtharg.nexttd.style.width = this.widtharg.nexttdwidth - x + 'px';
        this.widtharg.td.style.width = this.widtharg.tdwidth + x + 'px';
        removeListener(document, 'mousemove', this.widtharg.widthmove);
        removeListener(document, 'mouseup', this.widtharg.widthup);
    },
    closdrag: function (e) {
        e = e || window.event;
        var obj = e.srcElement || e.target;
        if (obj.nodeName.toLowerCase() == "span") obj = obj.parentNode;
        this.closarg.tdnum = obj.getAttribute('clos');
        ;
        addListener(document, 'mousemove', this.closarg.closmove);
        addListener(document, 'mouseup', this.closarg.closup);
    },
    closmove: function (e) {
        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        Css(this.img, {display: "block", left: e.clientX + 9 + "px", top: e.clientY + 20 + "px"});
    },
    closup: function () {
        this.img.style.display = "none";
        removeListener(document, 'mousemove', this.closarg.closmove);
        removeListener(document, 'mouseup', this.closarg.closup);
        if (this.closarg.totdnum == this.closarg.tdnum) return;
        var rows = this.table.getElementsByTagName('tr'), tds, n, o;
        if ((parseInt(this.closarg.tdnum) + 1) == parseInt(this.closarg.totdnum)) {
            o = this.closarg.tdnum;
            n = this.closarg.totdnum;
        }
        else {
            n = this.closarg.tdnum;
            o = this.closarg.totdnum;
        }
        for (var i = 0, l = rows.length; i < l; i++) {
            tds = rows[i].getElementsByTagName('td');
            try {
                rows[i].insertBefore(tds[n], tds[o]);
            }
            catch (err) {
                return;
            }
        }
        for (var i = 0, l = this.theadtds.length; i < l; i++)
            this.theadtds[i].setAttribute('clos', i);
    },
    edit: function (e) {
        var o = e.srcElement || e.target;
        if (!o.getAttribute('edit')) return;
        this.inputtd = o;
        var v = o.innerHTML;
        o.innerHTML = "";
        o.appendChild(this.input);
        this.input.value = v;
        this.input.focus();
    },
    save: function (o) {
        var edit = this.edits[o.parentNode.getAttribute('edit')];
        if (edit.rule.test(this.input.value)) {
            this.inputtd.innerHTML = this.input.value;
            this.inputtd = null;
        } else {
            alert(edit.message);
        }
    },
    sortTable: function (td, n, type) {
        var frag = document.createDocumentFragment(), str = td.getElementsByTagName('span')[0].innerHTML,
            span = td.getElementsByTagName('span')[0];
        if (this.row != null || td == this.sortCol) {
            this.rows.reverse();
            span.innerHTML = str.replace(/.$/, str.charAt(str.length - 1) == "↓" ? "↑" : "↓");
        } else {
            this.rows.sort(this.compare(n, type));
            span.innerHTML = span.innerHTML + "↑";
            this.sortCol != null && (this.sortCol.getElementsByTagName('span')[0].innerHTML = this.sortCol.getElementsByTagName('span')[0].innerHTML.replace(/.$/, ''));
        }
        ;
        for (var i = 0, l = this.rows.length; i < l; i++)
            frag.appendChild(this.rows[i]);
        this.table.tBodies[0].appendChild(frag);
        if (Sys.IE6) {
            for (var s in this.checkbox)
                this.checkbox[s].checked = true;
        }
        this.sortCol = td;
    },
    compare: function (n, type) {
        return function (a1, a2) {
            var convert = {
                int: function (v) {
                    return parseInt(v)
                },
                float: function (v) {
                    return parseFloat(v)
                },
                date: function (v) {
                    return v.toString()
                },
                string: function (v) {
                    return v.toString()
                }
            };
            !convert[type] && (convert[type] = function (v) {
                return v.toString()
            });
            a1 = convert[type](a1.cells[n].innerHTML);
            a2 = convert[type](a2.cells[n].innerHTML);
            if (a1 == a2) return 0;
            return a1 < a2 ? -1 : 1;
        };
    }
});
window.onload = function () {
    var set = [
        {id: 0, type: "int"},
        {id: 2, type: "string", edit: {rule: /^([a-z]|[\u4e00-\u9fa5]){2,}$/i, message: "请输入2位以上的汉字,或者是字母"}},
        {id: 3, type: "date", edit: {rule: /^\d{4}\-\d{2}\-\d{2}$/, message: "按这中格式输入日期1985-02-30"}},
        {id: 4, type: "string", edit: {rule: /^.{4,10}$/, message: "请输入4到10个字符"}}
    ];
    new Table($("tab"), set);
}