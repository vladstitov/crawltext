///<reference path="jquery.d.ts"/>
///<reference path="underscore.d.ts"/>


module crawl{
    class TextBlock{
        $view:JQuery;
        static transform:string='webkitTransform';
        private w:number;
        width():number{
            if(this.w) return this.w
           return this.$view.width();
        }
        position:number;
        posX:number=0;
        posY:number=0;
        el:HTMLElement;
        private isActive:boolean;

        getEnd():number{
            return this.posX+this.width();
        }
        isOut():boolean{
           return this.posX+this.width()<0
        }

        constructor(text:string){
            this.$view=$('<div>').addClass('abs nowrap msg').text(text);
            this.el = this.$view.get(0);

        }

        destroy():void{
            this.$view.remove();
        }
        moveX(step:number):void{
            this.posX+=step;
            this.render();
        }
        render():void{
            this.el.style[TextBlock.transform]= 'translate('+this.posX+'px,'+this.posY+'px)';
        }
        appendTo($cont):void{
            this.$view.appendTo($cont);
            setTimeout(()=>{this.w = this.$view.width()},100);
        }

    }

    export class CrawlText{
        $container:JQuery
        $view:JQuery;
        $scroll:JQuery;
        texts:TextBlock[];
        width:number;
        active:TextBlock[];

        getSupportedTransform():string {
            var prefixes = 'transform webkitTransform MozTransform OTransform msTransform'.split(' ');
            var div = document.createElement('div');
            for(var i = 0; i < prefixes.length; i++) {
                if(div && div.style[prefixes[i]] !== undefined) {
                    return prefixes[i];
                }
            }
            return null;
        }
        constructor($view:JQuery){
            TextBlock.transform = this.getSupportedTransform();
            console.log(TextBlock.transform);
            this.$view = $view;
            this.$scroll = $('<div>').addClass('rel').appendTo(this.$view);
          this.setWidth();
            this.active = [];
           var r =  this.getTexts();
            r.then(()=>{
              this.startScroll();
            })
        }

        setWidth():void{
            this.width = window.innerWidth
            this.$scroll.width(this.width);
        }
        current:number=-1;

        startScroll():void{
            if(this.isActive) return;
            this.isActive = true;
            this.addText();
            this.onAnimationFrame(0);
        }

        addText():void{
            var text:TextBlock = this.getNext();
            text.posX = this.width;
            this.active.push(text);
            text.appendTo(this.$scroll);
        }

        isActive:boolean;

        isRoom():boolean{
            if(this.active.length){
                var last = this.active[this.active.length-1];
                var end = last.getEnd();
              return end < this.width-50;//this.addText();
            }
            return false;
        }
        private moveall():void{
            var ar = this.active;
            ar.map(function(text:TextBlock,i:number){
                text.moveX(-1);
                if(text.isOut()){
                    text.destroy();
                    ar.splice(i,1);
                }
            })

        }
        stop():void{
            this.isActive = false;
        }
        private  onAnimationFrame(stamp:number){
            if(this.active.length ===0) this.stop();
            if(this.isActive)requestAnimationFrame((stamp)=>this.onAnimationFrame(stamp));
            this.moveall();
            if(this.isRoom()) this.addText();
        }

        getNext():TextBlock{
            this.current++;
            if(this.current>=this.texts.length) this.current = 0;
            return this.texts[this.current];
        }

        getTexts():JQueryPromise<CrawlText[]>{
           return $.get('http://callcenter.front-desk.ca/service/crawl?a=get').done((res)=>{
                this.texts = _.map(res.list,function(val:string){ return new TextBlock(val)});

            })
        }

    }
}

$(document).ready(function(){
    var text = new crawl.CrawlText($('#CrawlText'));
})