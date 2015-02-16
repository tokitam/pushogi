
var PUShogi = (function(){

    return function(canvas_name){

        var MODE_EDIT = 1;
        var MODE_EDIT_NONE = 1;
        var MODE_EDIT_HOLD = 2;

        var canvas_name;
        var canvas;
        var ctx;
        var mouseX;
        var mouseY;

        var komaList;
        var board;
        var mode;
        var mode_sub;
        
        /*
        var all_width = 656;
        var all_height = 416;
        var komadai_width = 138;
        var komadai_height = 138;
        var koma_base_x = komadai_width + 10;
        var koma_base_y = 10;
        var komaWidth = 40;
        var komaHeight = 44;
        var komaImageHeight = 40;
        var cursorImageHeight = 44;
        */
        var all_width;
        var all_height;
        var komadai_width;
        var komadai_height;
        var koma_base_x;
        var koma_base_y;
        var komaWidth;
        var komaHeight;
        var komaImageHeight;
        var cursorImageHeight;
        
        var moveKomaId = 0;
        var moveKomaType;
        var moveKoma;
        var moveKomaX;
        var moveKomaY;
        var komaImageList = new Array(32);
        var diffX;
        var diffY;
        
        var komaImageListId = [
          '01', '02', '03', '04', '05', '06', '07', '08', 
          '09', '0a', '0b', '0c',       '0e', '0f', 
          '11', '12', '13', '14', '15', '16', '17', '18', 
          '19', '1a', '1b', '1c',       '1e', '1f', 
        ];
        
        var imageMain;
        var komadai;
        var imageBoard;
        var imageCursorBlue;
        var imageCursorRed;
        
        komadai_width = 138;
        board_width = 380;
        board_height = 416;
        board_x = komadai_width;
        board_y = 0;
        
        mode = MODE_EDIT;
        mode_sub = MODE_EDIT_NONE;
        
        this.init = function() {

            if (canvas_name == "" || canvas_name == undefined) {
                canvas_name = "shogi_board";
            }
    
            canvas = document.getElementById(canvas_name);
            if ( ! canvas || ! canvas.getContext ) {
                document.write("Canvas tag id:" + canvas_name + " not found.<br />\n");
                return false;
            }
            
            var theme = new PUShogiGUITheme();
            console.log('theme:' + theme);
    
            board = new PUShogiGUIBoard();
            board.setupBoard(theme);

            all_width = board.theme.all_width;
            all_height = board.theme.all_height;
            console.log('all_width:' + all_width);
            komadai_width = board.theme.komadai_width;
            console.log('komadai_width:' + komadai_width);
            komadai_height = board.theme.komadai_height;
            koma_base_x = board.theme.koma_base_x;
            koma_base_y = board.theme.koma_base_y;
            komaWidth = board.theme.komaWidth;
            komaHeight = board.theme.komaHeight;
            komaImageHeight = board.theme.komaImageHeight;
            cursorImageHeight = board.theme.cursorImageHeight;
            


            canvas.width = all_width;
            canvas.height = all_height;
    
            ctx = canvas.getContext('2d');
    
            imageMain = new Image();
            imageMain.onload = function() {
                ctx.drawImage(imageMain, 0, 0, all_width, all_height);
            }
            imageMain.src = board.theme.image_main;
 
            /*
            imageBoard = new Image();
            imageBoard.onload = function() {
                ctx.drawImage(imageBoard, board_x, board_y, board_width, board_height);
            }
            imageBoard.src = board.theme.image_board;
            */
    
            /*
            komadai = new Image();
            komadai.onload = function() {
                ctx.drawImage(komadai, 0, 0, komadai_width, komadai_height);
                ctx.drawImage(komadai, 0, all_height - komadai_width, komadai_width, komadai_height);
                ctx.drawImage(komadai, all_width - komadai_width, all_height - komadai_width, komadai_width, komadai_height);
            }
            komadai.src = board.theme.image_komadai;
            */
    
            var koma = new Image();
            //koma.onload = function() {
            //    ctx.drawImage(koma, 0, 0, 40, 40);
            //}
            //koma.src = 'themes/pc/images/07.png';
            
            board.setBaseXY(koma_base_x, koma_base_y);
            board.setKomaSize(komaWidth, komaHeight);
            board.setKomadaiSize(komadai_width, komadai_height);
            board.setAllSize(all_width, all_height);
            
            for (i=0; i<komaImageListId.length; i++) {
                strId = komaImageListId[i];
                id = parseInt(strId, 16);
                komaImageList[id] = new Image();
                komaImageList[id].src = board.theme.image_dir + strId + ".png";
            }
        
            imageCursorBlue = new Image();
            imageCursorBlue.src = board.theme.image_cursor1;
        
            imageCursorRed = new Image();
            imageCursorRed.src = board.theme.image_cursor2;
        
        }
        
        this.init();
        
        // -------------------------------------------------------------

        canvas.adjustXY = function(e) {
            var rect = e.target.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        }

        canvas.onmousedown = function(e) {
            if (mode == MODE_EDIT) {
                this.drawBoardEditModeMouseDown(e);
            }
        }
        
        canvas.onmouseup = function(e) {
            if (mode == MODE_EDIT) {
                this.drawBoardEditModeMouseUp(e);
            }
        }
        
        canvas.onmousemove = function(e) {
            if (mode == MODE_EDIT) {
                //this.drawBoardEditModeMouseMove(e);
            }
        }
        
        canvas.onblur = function(e) {
            console.log("in onblue")
            if (mode == MODE_EDIT) {
                this.drawBoardEditModeBlur(e);
            }
        }
        
        canvas.drawBoardEditModeMouseDown = function(e) {
            this.adjustXY(e);
            
            var check = board.checkMouseDown(this.mouseX, this.mouseY);
            
            if (check == false) {
                return;
            }
            
            this.drawBoard();
            
            var tmpx = check[0];
            var tmpy = check[1];
            
            if (moveKomaId) {
                // 駒を選択済
                var komaId = board.getKomaId(tmpx, tmpy);
                
                if (komaId == moveKomaId) {
                    // 同じ駒（同じ座標）を選択した、終了
                    moveKomaId = 0;
                    this.drawBoard();
                }
                
                var check = board.checkMouseDown(this.mouseX, this.mouseY);
                
                var toX = check[0];
                var toY = check[1];
                
                board.move(moveKomaX, moveKomaY, toX, toY);

                //moveKoma.setVisible(true);
                moveKomaId = 0;
                this.drawBoard();
                
                board.debug_print();
                
            } else {
                // 駒を選択
                var komaId = board.getKomaId(tmpx, tmpy);
            
                if (komaId == 0) {
                    return;
                }
            
                var list = board.getKomaList();
                //board.setKomaVisible(tmpx - 1, tmpy - 1, false);
            
                moveKomaId = komaId;
                moveKoma = list[komaId];
                moveKomaType = list[komaId].getType();
                moveKomaX = tmpx;
                moveKomaY = tmpy;
                console.log("drawBoardEditModeMouseDown() moveKomaId:" + moveKomaId);
            
            }
            
            this.drawBoard();
        }
        
        canvas.drawBoardEditModeMouseUp = function(e) {
            return;
            this.adjustXY(e);
            
            if (moveKomaId == 0) {
                return;
            }
            
            console.log("x:" + this.mouseX + ", y:" + this.mouseY);
            var check = board.checkMouseDown(this.mouseX, this.mouseY);
            
            if (check == false) {
                moveKoma.setVisible(true);
                moveKomaId = 0;
            
                this.drawBoard();
                
                return;
            }
            
            var toX = check[0];
            var toY = check[1];
            
            if (toX == 50) {
                // to koma box
                
                board.getKomaBox().pushType(moveKomaType);
                board.setKoma(moveKomaX, moveKomaY, 0);
                moveKomaId = 0;
                
                this.drawBoard();

                board.debug_print();

                return;
            } else if (toX == 60) {
                // to komadai gote

                board.getKomaDai(1).pushType(moveKomaType);
                board.setKoma(moveKomaX, moveKomaY, 0);
                moveKomaId = 0;
                
                this.drawBoard();

                board.debug_print();


                return;
            } else if (toX == 70) {
                // to komadai sente

                board.getKomaDai(0).pushType(moveKomaType);
                board.setKoma(moveKomaX, moveKomaY, 0);
                moveKomaId = 0;
                
                this.drawBoard();

                board.debug_print();


                return;
            }

            board.move(moveKomaX, moveKomaY, toX, toY);

            moveKoma.setVisible(true);
            moveKomaId = 0;
            this.drawBoard();

            
            board.debug_print();
        }
        
        canvas.drawBoardEditModeMouseMove = function(e) {
            return;
            this.adjustXY(e);
            
            this.drawBoard();

            if (moveKomaId) {
                ctx.drawImage(komaImageList[moveKomaType], this.mouseX - (komaWidth / 2), this.mouseY - (komaHeight / 2), komaWidth, komaHeight);
            }
        }
        
        canvas.drawBoardEditModeBlur = function(e) {
            return;
            if (moveKomaId != 0) {
                moveKoma.setVisible(true);
                moveKomaId = 0;
            
                this.drawBoard();
                
                return;
            }

        }

        canvas.getMoveKomaGX = function(){
            return koma_base_x + komaWidth * (9 - moveKomaX);
        }
        
        canvas.getMoveKomaGY = function(){
            return koma_base_y + komaHeight * (moveKomaY - 1);
        }
        
        canvas.drawBoard = function() {
            ctx.fillStyle="rgb(255,255,255)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            console.log('2 komadai_width:' + komadai_width);

            ctx.drawImage(imageMain, 0, 0, all_width, all_height);

            /*
            ctx.drawImage(komadai, 0, 0, 138, 138);
            ctx.drawImage(komadai, 0, all_height - komadai_width, 138, 138);
            ctx.drawImage(komadai, all_width - komadai_width, all_height - komadai_width, komadai_width, komadai_width);
            ctx.drawImage(imageBoard, board_x, board_y, board_width, board_height);
            */
            
            

            var komaList = board.getKomaList();
            for (i=1; i < komaList.length; i++) {
                if (komaList[i].getVisible()) {
                    var type = komaList[i].getType();
                    ctx.drawImage(komaImageList[type], komaList[i].getGX(), komaList[i].getGY(), komaWidth, komaImageHeight);
                }
            }
            
            // --------------------------------------
            
            if (moveKomaId) {
                ctx.drawImage(imageCursorBlue, this.getMoveKomaGX(), this.getMoveKomaGY(), komaWidth, cursorImageHeight);
                console.log("getMoveKomaGX(): " + this.getMoveKomaGX());
                console.log("getMoveKomaGY(): " + this.getMoveKomaGY());
            }
            console.log("moveKomaId:" + moveKomaId);
            
            // ----------------------------------------------------------
            
            var komaBox = board.getKomaBox();
            var koma = komaBox.getKoma();
            
            // komabox fu
            var v;
            var b;
            var c;
            v = (komadai_width - komaWidth * 2) / koma[1];
            b = (komadai_width - komaWidth) / 3 + 8;
            c = all_height - komaHeight;
            for (i=0; i<koma[1]; i++) {
                ctx.drawImage(komaImageList[1], b + i * v, c, komaWidth, komaImageHeight);
            }
            
            // komabox kyo
            //v = (komadai_width / 2 - komaWidth) / koma[2];
            v = 3;
            b = 0;
            c = all_height - komaHeight;
            for (i=0; i<koma[2]; i++) {
                ctx.drawImage(komaImageList[2], b + i * v, c, komaWidth, komaImageHeight);
            }
            
            // komabox kei
            //v = (komadai_width / 2- komaWidth) / koma[3];
            //v = (komadai_width / 2 - komaWidth) / koma[4];
            v = 3;
            b = (komadai_width - komaWidth) - 10;
            c = all_height - komaHeight * 2 + 3;
            for (i=0; i<koma[3]; i++) {
                ctx.drawImage(komaImageList[3], b + i * v, c, komaWidth, komaImageHeight);
            }

            // komabox gin
            //v = (komadai_width / 2 - komaWidth) / koma[4];
            v = 3;
            b = (komadai_width - komaWidth) / 3 + 8;
            c = all_height - komaHeight * 2 + 3;
            for (i=0; i<koma[4]; i++) {
                ctx.drawImage(komaImageList[4], b + i * v, c, komaWidth, komaImageHeight);
            }

            // komabox kin 
            //v = (komadai_width / 2 - komaWidth) / koma[5];
            v = 3;
            b = 0;
            c = all_height - komaHeight * 2 + 3;
            for (i=0; i<koma[5]; i++) {
                ctx.drawImage(komaImageList[5], b + i * v, c, komaWidth, komaImageHeight);
            }

            // komabox kaku
            //v = (komadai_width / 2 - komaWidth) / koma[6];
            v = komaWidth / 5;
            b = (komadai_width - komaWidth) - 10;
            c = all_height - komaHeight * 3 + 3;
            for (i=0; i<koma[6]; i++) {
                ctx.drawImage(komaImageList[6], b + i * v, c, komaWidth, komaImageHeight);
            }

            // komabox ryu
            //v = (komadai_width - komaWidth) / 3 / koma[7];
            v = komaWidth / 5;
            b = (komadai_width - komaWidth) / 3 + 8;
            c = all_height - komaHeight * 3 + 3;
            for (i=0; i<koma[7]; i++) {
                ctx.drawImage(komaImageList[7], b + i * v, c, komaWidth, komaImageHeight);
            }

            // komabox oh
            //v = (komadai_width - komaWidth) / 3 / koma[8];
            v = komaWidth / 5;
            b = 0;
            c = all_height - komaHeight * 3 + 3;
            for (i=0; i<koma[8]; i++) {
                ctx.drawImage(komaImageList[8], b + i * v, c, komaWidth, komaImageHeight);
            }
            
            // --------------------------------------

            var komaDai = board.getKomaDai(1);
            
            // komadai gote fu
            var v;
            var b;
            var c;
            v = (komadai_width - komaWidth * 2) / komaDai.get(1);
            b = (komadai_width - komaWidth) / 3 + 8;
            c = 5;
            for (i=0; i<komaDai.get(1); i++) {
                ctx.drawImage(komaImageList[0x11], b + i * v, c, komaWidth, komaImageHeight);
            }
            
            
            /*
            
            // komadai gote kyo
            //v = (komadai_width / 2 - komaWidth) / koma[2];
            v = 3;
            b = 0;
            c = all_height - komaHeight;
            for (i=0; i<koma[2]; i++) {
                ctx.drawImage(komaImageList[2], b + i * v, c, komaWidth, komaImageHeight);
            }
            
            // komadai gote kei
            //v = (komadai_width / 2- komaWidth) / koma[3];
            //v = (komadai_width / 2 - komaWidth) / koma[4];
            v = 3;
            b = (komadai_width - komaWidth) - 10;
            c = all_height - komaHeight * 2 + 3;
            for (i=0; i<koma[3]; i++) {
                ctx.drawImage(komaImageList[3], b + i * v, c, komaWidth, komaImageHeight);
            }

            // komadai gote gin
            //v = (komadai_width / 2 - komaWidth) / koma[4];
            v = 3;
            b = (komadai_width - komaWidth) / 3 + 8;
            c = all_height - komaHeight * 2 + 3;
            for (i=0; i<koma[4]; i++) {
                ctx.drawImage(komaImageList[4], b + i * v, c, komaWidth, komaImageHeight);
            }

            // komadai gote kin 
            //v = (komadai_width / 2 - komaWidth) / koma[5];
            v = 3;
            b = 0;
            c = all_height - komaHeight * 2 + 3;
            for (i=0; i<koma[5]; i++) {
                ctx.drawImage(komaImageList[5], b + i * v, c, komaWidth, komaImageHeight);
            }

            // komadai gote kaku
            //v = (komadai_width / 2 - komaWidth) / koma[6];
            v = komaWidth / 5;
            b = (komadai_width - komaWidth) - 10;
            c = all_height - komaHeight * 3 + 3;
            for (i=0; i<koma[6]; i++) {
                ctx.drawImage(komaImageList[6], b + i * v, c, komaWidth, komaImageHeight);
            }

            // komadai gote ryu
            //v = (komadai_width - komaWidth) / 3 / koma[7];
            v = komaWidth / 5;
            b = (komadai_width - komaWidth) / 3 + 8;
            c = all_height - komaHeight * 3 + 3;
            for (i=0; i<koma[7]; i++) {
                ctx.drawImage(komaImageList[7], b + i * v, c, komaWidth, komaImageHeight);
            }

*/

            // ----------------------------------------------------
            
            komaDai = board.getKomaDai(0);
            
            // komadai sente fu
            var v;
            var b;
            var c;
            v = (komadai_width - komaWidth * 2) / komaDai.get(1);
            b = all_width - (komadai_width / 2);
            c = all_height - komaHeight;
            for (i=0; i<komaDai.get(1); i++) {
                ctx.drawImage(komaImageList[1], b + i * v, c, komaWidth, komaImageHeight);
            }
            
            

        }
        
        // --------------------------------------
        
        canvas.drawBoard();

    }

})();

var PUShogiGUIBoard = (function(){

    return function(){
    
        var board = new Array(9 * 9);
        var komaList = new Array(41);
        var hirate_koma = [
            '12', '13', '14', '15', '18', '15', '14', '13', '12', 
            '00', '16', '00', '00', '00', '00', '00', '17', '00', 
            '11', '11', '11', '11', '11', '11', '11', '11', '11', 
            '00', '00', '00', '00', '00', '00', '00', '00', '00', 
            '00', '00', '00', '00', '00', '00', '00', '00', '00', 
            '00', '00', '00', '00', '00', '00', '00', '00', '00', 
            '01', '01', '01', '01', '01', '01', '01', '01', '01', 
            '00', '07', '00', '00', '00', '00', '00', '06', '00', 
            '02', '03', '04', '05', '08', '05', '04', '03', '02', 
        ];
        var baseX;
        var baseY;
        var komaWidth;
        var komaHiehgt;
        var komaBox = new PUShogiGUIKomaBox();
        var komaDai = new Array(2);
        var komadaiWidth;
        var komadaiHeight;
        var allWidth;
        var allHeight;
        var theme;
        
        komaDai[0] = new PUShogiGUIKomaDai();
        komaDai[1] = new PUShogiGUIKomaDai();
        komaBox.setKomaList(komaList);
        komaDai[0].setKomaList(komaList);
        komaDai[1].setKomaList(komaList);
        
        for (i=0; i<81; i++) {
            board[i] = 0;
        }
        for (i=0; i<=40; i++) {
            komaList[i] = new PUShogiGUIKoma();
        }

        this.setupBoard = function(theme_obj){
        
            this.theme = theme_obj;
            
            var i = 1;
            for (y=0; y<9; y++) {
                for (x=0; x<9; x++) {
                    var koma = hirate_koma[y * 9 + x];
                    if (koma != "00") {
                        komaList[i].setXY(x + 1, y + 1);
                        komaList[i].setType(parseInt(koma, 16));
                        komaList[i].setId(i);
                        
                        this.setKomaId(x + 1, y + 1, i);
                        
                        komaBox.popType(parseInt(koma, 16));
                        
                        i++;
                    } else {
                        this.setKomaId(x + 1, y + 1, 0);
                    }
                }
            }
        }
        
        this.setKomaId = function(x, y, koma) {
            x--;
            y--;
            board[y * 9 + x] = koma;
        }
        
        this.getKomaId = function(x, y) {
            x--;
            y--;
            return board[y * 9 + x];
        }
        
        this.setKomaVisible = function(x, y, visible){
            var id = this.getKomaId(x + 1, y + 1);
            komaList[id].setVisible(visible);
        }
        
        this.getKomaList = function(){
            return komaList;
        }

        this.setBaseXY = function(x, y){
            baseX = x;
            baseY = y;
            for (i=1; i<komaList.length; i++) {
                komaList[i].setBaseXY(x, y);
            }
        }

        this.setKomaSize = function(width, height){
            komaWidth = width;
            komaHeight = height;
            for (i=1; i<komaList.length; i++) {
                komaList[i].setSize(width, height);
            }
        }

        this.setAllSize = function(width, height){
            allWidth = width;
            allHeight = height;
        }
        
        this.setKomadaiSize = function(width, height){
            komadaiWidth = width;
            komadaiHeight = height;
        }
        
        this.checkMouseDown = function(x, y) {

            if (x < komadaiWidth && (allHeight - komadaiHeight) < y) {
                // koma box
                
                if ((komadaiHeight - komaHeight) < y) {
                    if (x < komaWidth) {
                        // kyo
                        return new Array(50, 2);
                    } else {
                        // fu
                        return new Array(50, 1);
                    }
                } else if ((komadaiHeight - komaHeight * 2) < y) {
                    if (x < komaWidth) {
                        // kin
                        return new Array(50, 5);
                    } else if (x < komaWidth * 2) {
                        // gin
                        return new Array(50, 4);
                    } else {
                        // kei
                        return new Array(50, 3);
                    }
                } else if ((komadaiHeight - komaHeight * 3) < y) {
                    if (x < komaWidth) {
                        // oh
                        return new Array(50, 8);
                    } else if (x < komaWidth * 2) {
                        // hisya
                        return new Array(50, 7);
                    } else {
                        // kaku
                        return new Array(50, 6);
                    }
                }
                
                return new Array(50, 0);
            }

            if (x < komadaiWidth && y < komadaiHeight) {
                // komadai gote
                return new Array(60, 0);
            }

            if ((allWidth - komadaiWidth) < x && (allHeight - komadaiHeight) < y) {
                // komadai sente
                return new Array(70, 0);
            }

            if (baseX <= x && baseY <= y && 
                x < baseX + (9 * komaWidth) && y < baseY + (9 * komaHeight)) {
                // ok
            } else {
                return false;
            }

            var tmpx = 9 - Math.floor((x - baseX) / komaWidth);
            var tmpy = Math.floor((y - baseY) / komaHeight) + 1;
            
            return new Array(tmpx, tmpy);
        }
        
        this.setKoma = function(x, y, koma) {
            board[(y - 1) * 9 + x - 1] = koma;
        }
        
        this.move = function(fromX, fromY, toX, toY) {
        
            if (fromX == toX && fromY == toY) {
                return;
            }
        
            var fromKoma = this.getKomaId(fromX, fromY);
            var toKoma = this.getKomaId(toX, toY);
            
            if (fromKoma == 0) {
                return;
            }
            
            if (toKoma != 0) {
            
                var koma = komaList[toKoma];
                
                board[fromY * 9 + fromX] = 0;
                //komaBox.push(toKoma);
                var type = koma.getType();
                if (0x10 < type) {
                    komaDai[0].pushType(type);
                } else {
                    komaDai[1].pushType(type);
                }
                komaList[toKoma].setVisible(false);
                board[toY * 9 + toY] = fromKoma;
                komaList[fromKoma].setXY(toX, toY);
            
            }
            
            console.log("fromKoma:" + fromKoma);
            komaList[fromKoma].setXY(toX, toY);
            this.setKomaId(fromX, fromY, 0);
            this.setKomaId(toX, toY, fromKoma);
            
        }
        
        this.debug_print = function() {
            var tmp = "";
            console.log("---------------------");
            for (y=0; y<9; y++) {
                tmp = "";
                for (x=0; x<9; x++) {
                    tmp += board[y * 9 + x] + ' ';
                }
                console.log(tmp + "\r\n");
            }
            
            tmp = "";
            for (i=1; i<=7; i++) {
                tmp += komaDai[0].get(i) + " ";
            }
            console.log(tmp + "<br />\n");
            tmp = "";
            for (i=1; i<=7; i++) {
                tmp += komaDai[1].get(i) + " ";
            }
            console.log(tmp + "<br />\n");
        }
        
        this.getKomaBox = function() {
            return komaBox;
        }
        
        this.getKomaDai = function(sente_gote) {
            return komaDai[sente_gote];
        }
    }

})();

var PUShogiGUIKoma = (function(){

    return function(){
        var id;
        var type;
        var gote;
        var nari;
        var image;
        var baseX;
        var baseY;
        var x;
        var y;
        var adjustY = 2;
        var width;
        var height;
        var flgVisible = true;

        this.setImage = function(image){
            this.image = image;
        }

        this.getImage = function(){
            return this.image;
        }
        
        this.setBaseXY = function(x, y){
            this.baseX = x;
            this.baseY = y;
        }

        this.setSize = function(width, height){
            this.width = width;
            this.height = height;
        }
        
        this.setXY = function(x, y){
            this.x = x;
            this.y = y;
        }

        this.getX = function(){
            return this.x;
        }
        
        this.getY = function(){
            return this.y;
        }
        
        this.getGX = function(){
            return this.baseX + this.width * (9 - this.x);
        }
        
        this.getGY = function(){
            return this.baseY + this.height * (this.y - 1) + adjustY;
        }
        
        this.setId = function(id){
            this.id = id;
        }

        this.getId = function(){
            return this.id;
        }
        
        this.setVisible = function(visible){
            flgVisible = visible;
        }

        this.getVisible = function(){
            return flgVisible;
        }
        
        this.setType = function(type){
            this.type = type;
        }

        this.getType = function(){
            return this.type;
        }
        
        this.getKomaType = function() {
            return this.type & 0x7;
        }
    }

})();

var PUShogiGUIKomaDai = (function(){

    return function(){
    
        var komaDai = new Array(8);
        var komaIdList = new Array(40);
        var komaList;
        
        for (i=0; i<8; i++) {
            komaDai[i] = 0;
        }
        
        this.push = function(komaId, type) {
            komaIdList.push(komaId);
            komaBox[type]++;
        }
    
        this.pop = function(komaId, type) {
            return komaIdList.pop();
            komaDai[type]--;
        }
        
        this.setKomaList = function(list) {
            komaList = list;
        }

        this.pushType = function(type) {
            komaDai[type & 7]++;
        }
        
        this.popType = function(type) {
            komaDai[type & 7]--;
        }
        
        this.get = function(i) {
            return komaDai[i];
        }
    
    }
    
})();

var PUShogiGUIKomaBox = (function(){

    return function(){
    
        var komaBox = new Array(9);
        var komaIdList = new Array(40);
        var komaList;
        
        komaBox[1] = 18;
        komaBox[2] = 4;
        komaBox[3] = 4;
        komaBox[4] = 4;
        komaBox[5] = 4;
        komaBox[6] = 2;
        komaBox[7] = 2;
        komaBox[8] = 2;
        
        this.push = function(komaId) {
            //komaIdList.push(komaId);
            var koma = komaList[komaId];
            if (koma.getType() == 8 || koma.getType() == 0x18) {
                komaBox[8]++;
            } else {
                komaBox[koma.getType() & 7]++;
            }
        }
        
        this.pop = function(komaId) {
            //return komaIdList.pop();
            var koma = komaList[komaId];
            if (koma.getType() == 8 || koma.getType() == 0x18) {
                komaBox[8]--;
            } else {
                komaBox[koma.getType() & 7]--;
            }
        }

        this.pushType = function(type) {
            if (type == 8 || type == 0x18) {
                komaBox[8]++;
            } else {
                komaBox[type & 7]++;
            }
        }
        
        this.popType = function(type) {
            if (type == 8 || type == 0x18) {
                komaBox[8]--;
            } else {
                komaBox[type & 7]--;
            }
        }
        
        this.setKomaList = function(list) {
            komaList = list;
        }
        
        this.getKoma = function() {
            return komaBox;
        }
    
    }
    
})();

