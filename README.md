# pushogi

 ***!!!work-in-progress!!!***
 
JavaScript shogi board pushogi.

## smaple page

http://tokita.net/sample/pushogi/

EXAMPLE
========================
```
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <script type="text/javascript" src="themes/pc/theme.js"></script>
        <script type="text/javascript" src="pushogi.js"></script>
    <style type="text/css">
    * { margin: 0px; padding: 0px; border: 0px; }
    body { 
            -webkit-text-size-adjust: none;
            font-family:HiraKakuProN-W6;
    }
    </style>
    <script language="JavaScript">
    onload = function() {
      new PUShogi("shogi_board");
    };
    </script>
    </head>
    <body>
    <canvas id="shogi_board"></canvas>
    </body>
    </html>
```


