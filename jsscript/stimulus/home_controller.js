(() => {
    const application = Stimulus.Application.start()

    application.register("home", class extends Stimulus.Controller {
        static get targets() {
            return [ "name" ]
        }
        connect() {
            console.log("begin")
            this.backImageConnection()
            var that = this;
            window.onresize=function (size) {
                console.log("resize?? ",size);
                that.changeImg();
            }

        }

        backImageConnection() {
            this.imageUrlArr = [
                "img/welcome_img/1.jpg",
                "img/welcome_img/2.jpg",
                "img/welcome_img/3.jpg"
            ];

            this.bitmapCanvas = document.createElement('canvas');
            this.bitmapCtx = this.bitmapCanvas.getContext('2d');

            this.canLoadImg = true;
            this.timeCount = 0;
            this.imageIndex = 0;

            this.animsArr = new Array();
            this.titleAnimationComplete = true;
            // console.log("connect@!", this.imageUrlArr)

            this.changeImg()

            setInterval(() => {
                this.imageTimer()
            }, 1000)
        }


        imageTimer() {
            // console.log("timer fire")
            if (this.canLoadImg && this.animsArr.length <= 0) {
                this.timeCount++
                if (this.timeCount % 10 == 0) {
                    // console.log("draw")
                    this.cropImageToPiece()
                    this.imageIndex++
                    if (this.imageIndex >= this.imageUrlArr.length) { this.imageIndex = 0 }
                }
            }
        }


        floadAnime() {
            // console.log('anime')
            anime({
                targets: '.dotChild',
                scale: [
                    { value: 0, easing: 'easeOutSine', duration: 500 }
                ],
                delay: anime.stagger(50, { grid: [this.outterColumn, this.outterRow], from: 'first' }),
                complete: function(anim) {
                    // console.log("remove anim")
                    if (anim.completed) {
                        var dotParent = document.querySelector('.dot')

                        while (dotParent.hasChildNodes()) {
                            dotParent.removeChild(dotParent.firstChild);
                        }
                    }
                }
            });
        }

        changeImg() {
            this.drawImg(this.imageUrlArr[this.imageIndex])
            if (this.imageIndex + 1 < this.imageUrlArr.length) {
                this.loadImg(this.imageUrlArr[this.imageIndex + 1])
            }
        }

        loadImg(url) {
            var img = new Image()
            img.src = url
        }

        drawImg(url) {

            var canvas = document.getElementById('bgImgCanvas')
            var ctx = canvas.getContext('2d')

            canvas.width = document.body.clientWidth
            canvas.height = document.body.clientHeight

            var img = new Image()
            var that = this
            img.onload = function() {
                // console.log('image load!')
                //center sizetofill
                var imgRadio = img.width / img.height
                var clientRadio = document.body.clientWidth / document.body.clientHeight
                var heightFit = (imgRadio > clientRadio)
                var x, y, sizeWidth, sizeHeight
                if (heightFit) {
                    sizeHeight = document.body.clientHeight
                    sizeWidth = imgRadio * sizeHeight
                    x = (document.body.clientWidth - sizeWidth) / 2
                    y = 0
                } else {
                    sizeWidth = document.body.clientWidth
                    sizeHeight = sizeWidth / imgRadio
                    x = 0
                    y = (document.body.clientHeight - sizeHeight) / 2
                }
                ctx.drawImage(img, x, y, sizeWidth, sizeHeight);

                that.canLoadImg = true
                that.floadAnime()
            }

            img.src = url

            that.canLoadImg = false
        }


        cropImageToPiece() {

            this.cubeWidth = 50
            this.cubeHeight = 50

            this.imgPieceWidth = document.body.clientWidth % this.cubeWidth
            this.imgPieceHeight = document.body.clientHeight % this.cubeHeight

            this.outterColumn = parseInt(document.body.clientWidth / this.cubeWidth) + (this.imgPieceWidth > 0 ? 1 : 0)
            this.outterRow = parseInt(document.body.clientHeight / this.cubeHeight) + (this.imgPieceHeight > 0 ? 1 : 0)


            // console.log('cropImageToPiece begin === ' + this.imgPieceHeight + '---' + this.imgPieceWidth)
            var canvas = document.getElementById('bgImgCanvas')
            var ctx = canvas.getContext('2d')

            var cropWidth = this.cubeWidth
            var cropHeight = this.cubeHeight
            var that = this
            for (var i = 0; i < this.outterRow; i++) {
                for (var j = 0; j < this.outterColumn; j++) {

                    if (j == this.outterColumn - 1 && this.imgPieceWidth > 0) {
                        cropWidth = this.imgPieceWidth
                    } else {
                        cropWidth = this.cubeWidth
                    }

                    if (i == this.outterRow - 1 && this.imgPieceHeight > 0) {
                        cropHeight = this.imgPieceHeight
                    } else {
                        cropHeight = this.cubeHeight
                    }

                    (function() {
                        that.cropImage(ctx.getImageData(j * that.cubeWidth, i * that.cubeHeight, cropWidth, cropHeight))
                    })()
                }
            }
            // console.log('cropImageToPiece end ===' + this.outterColumn + '---' + this.outterRow)

            setTimeout(() => {
                this.changeImg()
            }, 1500)

        }


        cropImage(imgData) {
            // console.log('crp')
            // sx, sy, sWidth, sHeight
            this.bitmapCanvas.width = imgData.width;
            this.bitmapCanvas.height = imgData.height;
            this.bitmapCtx.rect(0, 0, imgData.width, imgData.height);
            this.bitmapCtx.fillStyle = 'white';
            this.bitmapCtx.fill();
            this.bitmapCtx.putImageData(imgData, 0, 0);
            // imageData, dx, dy
            // 创建img 块
            var img = document.createElement('img');
            img.src = this.bitmapCanvas.toDataURL('image/jpeg', 0.92);
            this.buildImgFragment(img, imgData.width, imgData.height)
            img = null
        }

        buildImgFragment(imageEle, cssWidth, cssHeight) {

            var dotParent = document.querySelector('.dot')

            var dotsFragment = document.createDocumentFragment();

            imageEle.classList.add("dotChild")
            imageEle.setAttribute("style", `width: ${cssWidth}px;height: ${cssHeight}px;background-color: black;position: relative;`)

            dotsFragment.appendChild(imageEle);

            dotParent.appendChild(dotsFragment)

            dotParent = null
            dotsFragment = null
        }


        blogAction() {

            var blogDiv = document.querySelector('.blog-div')

            if (this.animsArr.length <= 0) {
                console.log("begin");
            	var lab = document.querySelector('.lab-div')
            	var about = document.querySelector('.about-div')

            	this.beginFrameAnimation(blogDiv,[lab,about])

            } else {
                console.log("reset");
                console.log("anim log", this.blogAnimation)
                this.resetAction()
            }
        }

        loadBlogPage() {
            fetch("blog.html")
                .then(response => response.text())
                .then(html => {

                	var domparse = new DOMParser();
                	var doc = domparse.parseFromString(html, "text/html")

                    var iframe = document.querySelector('.iframe-container')
                    iframe.innerHTML = doc.body.innerHTML

                    for (let i = 0;i<doc.scripts.length;i++){
                        eval(doc.scripts[i].text);
                    }

                })
        }

        divIsVeriticalAlignment() {
            var labX = document.querySelector('.lab-div').getBoundingClientRect().x

            if (labX == 0) {
                return true
            } else {
                return false
            }
        }



        laboratoryAction() {


        	var lab = document.querySelector('.lab-div')
            if (this.animsArr.length <= 0) {
            	var blogDiv = document.querySelector('.blog-div')
            	var about = document.querySelector('.about-div')

            	this.beginFrameAnimation(lab,[blogDiv,about])

            } else {
                this.resetAction()
            }

        }

        aboutAction() {

        	var about = document.querySelector('.about-div')
            if (this.animsArr.length <= 0) {
            	var blogDiv = document.querySelector('.blog-div')
            	var lab = document.querySelector('.lab-div')

            	this.beginFrameAnimation(about,[blogDiv,lab])

            } else {
                this.resetAction()
            }
        }
        beginFrameAnimation(clickEle, otherElement) {

            console.log("cur animes -- ",anime.running);
            if (this.animsArr.length > 0) return;
            if (this.titleAnimationComplete == false) return;
            this.titleAnimationComplete = false;

            this.animsArr[0] = anime({
                targets: clickEle,
                translateY: {
                    value: `-=${clickEle.offsetTop}px`,
                    duration: 2000,
                    easing: 'spring(1,80,30,0)'
                },


            });

            this.animsArr[1] = anime({
                targets: '.normal-cover',
                opacity: .7,
                duration: 2000
            });

            this.animsArr[2] = anime({
                // `-${blogDiv.offsetTop}px`
                targets: otherElement,
                opacity: .0,
                duration: 1000
            });

            this.showContainer(clickEle)

        }

        showContainer(clickEle) {
            let lab = document.querySelector('.container-fluid');

            let fragment = document.createDocumentFragment();
            let containers = document.getElementsByClassName("iframe-container")[0];
            if (containers == null){
                containers = document.createElement("div");
                containers.classList.add("iframe-container", "iframe-custom-box");
                containers.setAttribute("frameborder", "0");
            }

            let top = 0;
            let left = 0;
            let positionStr = '';
            if (this.divIsVeriticalAlignment()) {
                top = clickEle.getBoundingClientRect().height;
            } else {
                let x = clickEle.getBoundingClientRect().x;
                if ( x > 0) {
                    if (x > document.body.clientWidth * 0.5) {
                        positionStr = `right:${clickEle.getBoundingClientRect().width}px`;
                    }else{
                        top = clickEle.getBoundingClientRect().height;
                    }
                }else{
                    left = clickEle.getBoundingClientRect().width;
                    positionStr = `left:${left}px`;
                }
            }


            containers.setAttribute("style", `top:${top}px;${positionStr};width:calc(100% - ${left}px);height:calc(100% - ${top}px);opacity:0;`)


            fragment.appendChild(containers);
            lab.parentElement.appendChild(fragment);

            var that = this;
            this.animsArr[3] = anime({
                targets: containers,
                opacity: [.0, 1],
                duration: 2000,
                delay: 500,
                complete : function () {
                    that.titleAnimationComplete = true;
                }
            });

            this.loadBlogPage();
        }

        resetAction() {
            console.log("animArr -- ",this.animsArr);
            if (this.titleAnimationComplete == false) {
                console.log("anim reset ",this.titleAnimationComplete);
                return;
            }
            this.titleAnimationComplete = false;

            var that = this;
            this.animsArr[3].complete = function () {
                var containers = document.getElementsByClassName("iframe-container")[0];
                containers.parentNode.removeChild(containers);
                that.titleAnimationComplete = true;
                that.animsArr = [];
            };
            for (var i = 0 ;i < this.animsArr.length ; i++) {
                var anim = this.animsArr[i];
                // anim.direction = 'reverse';
                anim.reverse();
                anim.play();
            }

        }

    })
})()
