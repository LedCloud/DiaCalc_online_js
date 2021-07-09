{* Smarty *} 
{include file='header.tpl'}
<link rel="stylesheet" type="text/css" href="css/diary.css?18092018">
<script src="https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
<script src="js/classes.js?01112018"></script>
<script src="js/functions.js?01102018"></script>
<script src="js/diary.js?01112018"></script>
<script>
    var settings ={ldelim}
        whole   : {$settings.whole},
        mmol    : {$settings.mmol},
        be      : {$be},
        menuinfo: {$settings.menuinfo},
        period  : {$settings.period},
        calorlimit:{$settings.calorlimit}
    {rdelim}; 
    var target = new Sugar({$settings.shtarget});
    var shlow = new Sugar({$settings.shlow});
    var shhigh = new Sugar({$settings.shhigh});
</script>
</head>
<body oncontextmenu="return false;">
<div data-role="page" id="page-eventslist-0" class="page-swipe">
    <div data-role="panel" id="miscPanel" data-display="overlay"> 
        <h3>Дополнительно</h3>
        <div data-role="controlgroup">
        <a href="index.php?{$sid}" data-ajax="false" class="ui-btn  ui-shadow ui-corner-all">Расчет доз</a>
        <a href="coefs.php?{$sid}" data-ajax="false" class="ui-btn  ui-shadow ui-corner-all">Коэффициенты</a>
        <a href="archive.php?{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all">Архив</a>
        <a href="calcs.php?{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all">Пересчёты</a>
        </div>
        <div data-role="controlgroup">
        <a href="settings.php?{$sid}" data-ajax="false" class="ui-btn  ui-shadow ui-corner-all">Настройки</a>
        <a href="changepass.php?{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all">Изменить пароль</a>
        </div>
        <a href="?desktop&{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all">Полная версия</a>
        <hr>
        <a href="?exit&{$sid}" data-ajax="false" class="ui-btn ui-shadow ui-corner-all">Выйти</a>
    </div>
    <div data-role="header" data-position="fixed" id="events-header">
        <a href="#miscPanel" class="ui-btn ui-btn-left ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left ui-btn-icon-notext">Дополнительно</a>
        <h3 id="page-header-0" class="page-header">События</h3>
        <div data-role="collapsible" id="events-new-menu" class="ui-btn-right">
            <h4>Доб</h4>
            <ul data-role="listview">
                <li data-icon="heart"><a href="#" id="page-events-add-sugar">Замер СК</a></li>
                <li data-icon="comment"><a href="#" id="page-events-add-remark">Коммент</a></li>
                
                <li data-role="list-divider"></li>
                <li data-icon="plus"><a href="#" id="page-events-add-page">Стр</a></li>
            </ul>
        </div>
        <fieldset class="ui-grid-a sideByside">
            <div  class="ui-block-a">
                <fieldset data-role="fieldcontain date-in-header">
                  <input type="date" class="interval-date" id="start-date-0">
                </fieldset>
            </div>
            <div class="ui-block-b">
                <fieldset data-role="fieldcontain date-in-header">
                    <input type="date" class="interval-date" id="end-date-0">
                </fieldset>
            </div>
        </fieldset>
        {*<input type="text" name="events-filter" id="events-filter" placeholder="Фильтр">*}
    </div>
    <div data-role="main" class="ui-content events-list" id="events-list-0">
        
    </div>
</div>
<div data-role="page" id="page-remark-sugar-info">
    <div data-role="header" data-position="fixed">
        <div data-role="header">
            <a href="#page-eventslist-0" data-transition="flip" data-direction="reverse" data-icon="arrow-l">Назад</a>
            <h1 id="page-RS-header"></h1>
        </div>
    </div>
    <div data-role="main" class="ui-content">
        <form>
            <label for="page-RS-date">Дата:</label>
            <input type="date" name="page-RS-date" id="page-RS-date">
            <label for="page-RS-time">Время:</label>
            <input type="time" name="page-RS-time" id="page-RS-time">
            <div id="page-RS-sugar-filed">
                <label for="page-RS-time">СК:</label>
                <input type="number" name="page-RS-sugar" autofocus class="select-all" id="page-RS-sugar" step="">
            </div>
            <label for="page-RS-remark">Комментарий:</label>
            <textarea name="page-RS-remark" autofocus id="page-RS-remark"></textarea>
        </form>
        <input type="button" id="page-RS-save" data-icon="check" value="Сохранить">
        <input type="button" id="page-RS-delete" data-icon="delete" data-theme="b" value="Удалить">
    </div>
</div>
<div data-role="page" id="page-menu-info">
    <div data-role="header" data-position="fixed">
        <div data-role="header">
            <a href="#page-eventslist-0" data-transition="flip" data-direction="reverse" data-icon="arrow-l">Назад</a>
            <h1>Сохр. меню</h1>
        </div>
    </div>
    <div data-role="main" class="ui-content">
        <p id="page-menu-info-remark">{*
        <span id="page-menu-info-datetime">12:33<br>12.04.2005</span>
        Comment Comment Comment Comment CommentCommentComment CommentComment CommentCommentComment
        *}
        </p>
        <table class='menu-page-table'><tbody>
            <tr>
                <td><sub>СК1</sub><span id="s1" class="results">110</span></td>
                <td><sub>СК2</sub><span id="s2" class="results">152</span></td>
                <td><sub>ЦЕИ</sub><span id="k3" class="results">28</span></td>
            </tr>
            <tr>
                <td><sub>К1</sub><span id="k1" class="results">1.10</span></td>
                <td><sub>К2</sub><span id="k2" class="results">0.25</span></td>
                <td><sub>ХЕ</sub><span id="be" class="results">12</span></td>
            </tr>
            </tbody></table><hr>
        <table  class='menu-page-table'><tbody>
        <tr>
            <td><sub>БД</sub><span id="dose-quick" class="results"></span></td>
            <td rowspan="2">+</td>
            <td><sub>МД</sub><span id="dose-slow" class="results"></span></td>
            <td rowspan='2' >
                = <sub>Σ</sub>
                    <span id="dose-whole" class="results"></span></td>
        </tr>
        <tr>
            <td><sub>ДПС</sub><span class="results" id="dose-dps"></span></td>
            <td><sub>КД</sub><span class="results" id="dose-kd"></span></td>
        </tr>
        </tbody></table><hr>
        <table class='menu-page-table table-striped'><tbody>
            <tr>
                <td>Б</td><td>Ж</td><td>У</td><td>ГИ</td><td>Ккал</td><td>ХЕ</td>
            </tr>
            <tr>
                <td class="results" id="page-menu-prot"></td>
                <td class="results" id="page-menu-fat"></td>
                <td class="results" id="page-menu-carb"></td>
                <td class="results" id="page-menu-gi"></td>
                <td class="results" id="page-menu-calor"></td>
                <td class="results" id="page-menu-be-amount"></td>
            </tr>
        </tbody></table>
        
        <ul data-role="listview" data-count-theme="b" data-inset="true" id="page-menu-list">
            <li>One line <span class="ui-li-count">12</span></li>
            <li>One line <span class="ui-li-count">12 гр.</span></li>
            <li>One line</li>
        </ul>
        <input type="button" id="page-menu-restore" data-icon="action" value="Восстановить">
        <input type="button" id="page-menu-delete" data-icon="delete" data-theme="b" value="Удалить">
    </div>
</div>
<div data-role="page" id="page-calor-detail">
    <div data-role="header" data-position="fixed">
        <div data-role="header">
            <a href="#page-eventslist-0" data-transition="flip" data-direction="reverse" data-icon="arrow-l">Назад</a>
            <h1>Итоги дня</h1>
        </div>
    </div>
    <div data-role="main" class="ui-content">
        <h3 id="page-calor-detail-date"></h3>
        <table class='menu-page-table table-striped-horizontal'><tbody>
            <tr>
                <td>Съедено</td>
                <td>Лимит</td>
            </tr>
            <tr>
                <td class="results" id="page-calor-info-eaten"></td>
                <td class="results">{$settings.calorlimit}</td>
            </tr>
        </tbody></table>
        <hr>
        <div class="ui-body ui-body-a ui-corner-all">
        <p>Употреблено питательных веществ, а так же их влияние на калорийность.</p>
        </div>
        <table class='menu-page-table table-striped-horizontal'><tbody>
            <tr>
                <td></td><td>Б</td><td>Ж</td><td>У</td>
            </tr>
            <tr>
                <td>Всего</td>
                <td class="results" id="page-calor-info-prot"></td>
                <td class="results" id="page-calor-info-fat"></td>
                <td class="results" id="page-calor-info-carb"></td>
            </tr>
            <tr>
                <td>100%=</td>
                <td class="results" id="page-calor-info-pcnt-prot"></td>
                <td class="results" id="page-calor-info-pcnt-fat"></td>
                <td class="results" id="page-calor-info-pcnt-carb"></td>
            </tr>
        </tbody></table>
    </div>
</div>        
<div data-role="page" id="page-eventslist-1" class="page-swipe">
    <div data-role="header" data-position="fixed">
        <div data-role="header">
            <a href="#page-eventslist-0" data-transition="flip" data-direction="reverse" data-icon="home">Стр. 1</a>
            <h1 id="page-header-1" class="page-header">Стр. 2</h1>
            <a href="#" class="ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all ui-btn-right"
               id="page-eventslist-1-btn-delete">NoText</a>
        </div>
        <fieldset class="ui-grid-a sideByside">
            <div  class="ui-block-a">
                <fieldset data-role="fieldcontain date-in-header">
                  <input type="date" class="interval-date" id="start-date-1">
                </fieldset>
            </div>
            <div class="ui-block-b">
                <fieldset data-role="fieldcontain date-in-header">
                    <input type="date" class="interval-date" id="end-date-1">
                </fieldset>
            </div>
        </fieldset>
    </div>
    <div data-role="main" class="ui-content events-list" id="events-list-1">
    </div>
</div>
<div data-role="page" id="page-eventslist-2" class="page-swipe">
    <div data-role="header" data-position="fixed">
        <div data-role="header">
            <a href="#page-eventslist-0" data-transition="flip" data-direction="reverse" data-icon="home">Стр. 1</a>
            <h1 id="page-header-2" class="page-header">Стр. 3</h1>
            <a href="#" class="ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all ui-btn-right"
               id="page-eventslist-2-btn-delete">NoText</a>
        </div>
        <fieldset class="ui-grid-a sideByside">
            <div  class="ui-block-a">
                <fieldset data-role="fieldcontain date-in-header">
                  <input type="date" class="interval-date" id="start-date-2">
                </fieldset>
            </div>
            <div class="ui-block-b">
                <fieldset data-role="fieldcontain date-in-header">
                    <input type="date" class="interval-date" id="end-date-2">
                </fieldset>
            </div>
        </fieldset>
    </div>
    <div data-role="main" class="ui-content events-list" id="events-list-2">
    </div>
</div>
