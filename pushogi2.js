
var PUShogiGUIKomaBox = function() {
    var self = this;

    var komaBox = new Array(9);
    var komaIdList = new Array(40);
    var komaText = new Array(9);
    var komaList;

    // initialize
    init();
    
    function init() {
        komaBox[1] = 18; // fu
        komaBox[2] = 4;  // kyo
        komaBox[3] = 4;  // kei
        komaBox[4] = 4;  // gin
        komaBox[5] = 4;  // kin
        komaBox[6] = 2;  // kaku
        komaBox[7] = 2;  // hisya
        komaBox[8] = 2;  // oh

        komaText[1] = 'FU';
        komaText[2] = 'KYO';
        komaText[3] = 'KEI';
        komaText[4] = 'GIN';
        komaText[5] = 'KIN';
        komaText[6] = 'KAKU';
        komaText[7] = 'HISHA';
        komaText[8] = 'OH';
    }

    self.to_string = function() {
        var tmp = '';

        for (i=1; i<=8; i++) {
            tmp += komaText[i] + ':' + komaBox[i] + ' ';
        }

        return tmp;
    }

    self.show = function() {
        console.log(self.to_string());
    };
};

var box = new PUShogiGUIKomaBox();
box.show();
