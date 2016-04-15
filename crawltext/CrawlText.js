///<reference path="jquery.d.ts"/>
///<reference path="underscore.d.ts"/>
var crawl;
(function (crawl) {
    var TextBlock = (function () {
        function TextBlock(text) {
            this.posX = 0;
            this.posY = 0;
            this.$view = $('<div>').addClass('abs nowrap msg').text(text);
            this.el = this.$view.get(0);
        }
        TextBlock.prototype.width = function () {
            if (this.w)
                return this.w;
            return this.$view.width();
        };
        TextBlock.prototype.getEnd = function () {
            return this.posX + this.width();
        };
        TextBlock.prototype.isOut = function () {
            return this.posX + this.width() < 0;
        };
        TextBlock.prototype.destroy = function () {
            this.$view.remove();
        };
        TextBlock.prototype.moveX = function (step) {
            this.posX += step;
            this.render();
        };
        TextBlock.prototype.render = function () {
            this.el.style[TextBlock.transform] = 'translate(' + this.posX + 'px,' + this.posY + 'px)';
        };
        TextBlock.prototype.appendTo = function ($cont) {
            var _this = this;
            this.$view.appendTo($cont);
            setTimeout(function () { _this.w = _this.$view.width(); }, 100);
        };
        TextBlock.transform = 'webkitTransform';
        return TextBlock;
    })();
    var CrawlText = (function () {
        function CrawlText($view) {
            var _this = this;
            this.current = -1;
            TextBlock.transform = this.getSupportedTransform();
            console.log(TextBlock.transform);
            this.$view = $view;
            this.$scroll = $('<div>').addClass('rel').appendTo(this.$view);
            this.setWidth();
            this.active = [];
            var r = this.getTexts();
            r.then(function () {
                _this.startScroll();
            });
        }
        CrawlText.prototype.getSupportedTransform = function () {
            var prefixes = 'transform webkitTransform MozTransform OTransform msTransform'.split(' ');
            var div = document.createElement('div');
            for (var i = 0; i < prefixes.length; i++) {
                if (div && div.style[prefixes[i]] !== undefined) {
                    return prefixes[i];
                }
            }
            return null;
        };
        CrawlText.prototype.setWidth = function () {
            this.width = window.innerWidth;
            this.$scroll.width(this.width);
        };
        CrawlText.prototype.startScroll = function () {
            if (this.isActive)
                return;
            this.isActive = true;
            this.addText();
            this.onAnimationFrame(0);
        };
        CrawlText.prototype.addText = function () {
            var text = this.getNext();
            text.posX = this.width;
            this.active.push(text);
            text.appendTo(this.$scroll);
        };
        CrawlText.prototype.isRoom = function () {
            if (this.active.length) {
                var last = this.active[this.active.length - 1];
                var end = last.getEnd();
                return end < this.width - 50; //this.addText();
            }
            return false;
        };
        CrawlText.prototype.moveall = function () {
            var ar = this.active;
            ar.map(function (text, i) {
                text.moveX(-1);
                if (text.isOut()) {
                    text.destroy();
                    ar.splice(i, 1);
                }
            });
        };
        CrawlText.prototype.stop = function () {
            this.isActive = false;
        };
        CrawlText.prototype.onAnimationFrame = function (stamp) {
            var _this = this;
            if (this.active.length === 0)
                this.stop();
            if (this.isActive)
                requestAnimationFrame(function (stamp) { return _this.onAnimationFrame(stamp); });
            this.moveall();
            if (this.isRoom())
                this.addText();
        };
        CrawlText.prototype.getNext = function () {
            this.current++;
            if (this.current >= this.texts.length)
                this.current = 0;
            return this.texts[this.current];
        };
        CrawlText.prototype.getTexts = function () {
            var _this = this;
            return $.get('http://callcenter.front-desk.ca/service/crawl?a=get').done(function (res) {
                _this.texts = _.map(res.list, function (val) { return new TextBlock(val); });
            });
        };
        return CrawlText;
    })();
    crawl.CrawlText = CrawlText;
})(crawl || (crawl = {}));
$(document).ready(function () {
    var text = new crawl.CrawlText($('#CrawlText'));
});
//# sourceMappingURL=CrawlText.js.map