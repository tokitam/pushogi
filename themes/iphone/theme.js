
var PUShogiGUITheme = (function(){

    return function(){
        //
        this.theme_dir = 'iphone';
    
        this.all_width = 320;
        this.all_height = 420;
        //this.all_width = 656;
        //this.all_height = 416;
        this.komadai_width = 138;
        this.komadai_height = 138;
        this.koma_base_x = this.komadai_width + 10;
        this.koma_base_y = 10;
        this.komaWidth = 40;
        this.komaHeight = 44;
        this.komaImageHeight = 40;
        this.cursorImageHeight = 44;
        
        this.image_dir = 'themes/' + this.theme_dir + '/images/';
        
        // image file
        this.image_main = this.image_dir + 'main.png';
        this.image_board = this.image_dir + 'board_380x416.png';
        this.image_komadai = this.image_dir + 'komadai.png';
        this.image_cursor1 = this.image_dir + 'cursor_blue.png';
        this.image_cursor2 = this.image_dir + 'cursor_red.png';
        
    }
})();

