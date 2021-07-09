{* Smarty *} 
{include file='header_d.tpl'}
<link rel="stylesheet" type="text/css" href="css/diary_d.css?18092018" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
<script src="js/BootstrapMenu.min.js"></script>
<script src="js/classes.js?01112018"></script>
<script src="js/functions.js?01102018"></script>
<script src="js/jquery.scrollTo-min.js"></script>
<script src="js/diary_d.js?01112018"></script>

{*<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.bundle.min.js"></script>*}
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
<body>
    
<nav class="navbar navbar-default" id="navbar">
  <div class="container-fluid">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="#">DiaCalc online &bull; Дневник</a>
    </div>
    <div class="collapse navbar-collapse" id="myNavbar">
    <ul class="nav navbar-nav">
      <li><a href="index.php?{$sid}"><span class="glyphicon glyphicon-cutlery"></span> Расчет доз</a></li>
    </ul>
    <ul class="nav navbar-nav">
	<li class="dropdown">
	  <a class="dropdown-toggle" data-toggle="dropdown" href="#"><span class="glyphicon glyphicon-cog"></span> Дополнительно
           <span class="caret"></span></a>
            <ul class="dropdown-menu">
             <li><a href="archive.php?{$sid}"><span class="glyphicon glyphicon-briefcase"></span> Архив</a></li>
	     <li><a href="coefs.php?{$sid}"><span class="glyphicon glyphicon-list-alt"></span> Коэффициенты</a></li>
             <li><a href="calcs.php?{$sid}"><span class="glyphicon glyphicon-refresh"></span> Пересчёты</a></li>
             <li role="separator" class="divider"></li>
             <li><a href="settings.php?{$sid}"><span class="glyphicon glyphicon-wrench"></span> Настройки</a></li>
             <li><a href="changepass.php?{$sid}"><span class="glyphicon glyphicon-user"></span> Сменить пароль</a></li>
             <li role="separator" class="divider"></li>
             <li><a href="?mobile&{$sid}"><span class="glyphicon glyphicon-phone"></span> Мобильная версия</a></li>
            </ul>
         </li>
    </ul>
    <ul class="nav navbar-nav navbar-right">
      <li><a href="?exit&{$sid}"><span class="glyphicon glyphicon-log-in"></span> Выход</a></li>
    </ul>
    </div>
  </div>
</nav>
    
<div class="container well" id="main">
<div class=row"> <!--Это должен быть один ряд во всю ширину -->
    <div class="col-sm-6 pages" id="page-0">
        <div id="btns">
        <div class="btn-group">
          <button type="button" class="btn btn-primary btn-sm" id="add-sh-btn" 
                  title="Добавить измерение СК"><span class="glyphicon glyphicon-pushpin"></span></button>
          <button type="button" class="btn btn-primary btn-sm" id="add-remark-btn"
                  title="Добавить комментарий"><span class="glyphicon glyphicon-comment"></span></button>
        </div>
        <button type="button" class="btn btn-sm" id="collapse-all-btn-0" title="Закрыть или раскрыть">
            <span class="glyphicon glyphicon-resize-vertical"></span></button>
        <button type="button" class="btn btn-default  btn-sm pull-right" id="add-page-btn" title="Добавить страницу">
            <span class="glyphicon glyphicon-plus"></span></button>
        
        <form class="form-inline">
            <div class="form-group">
                {*<label for="focusedInput">От:</label>*}
                <input class="form-control input-sm interval-date" id="start-date-0" type="date">
            </div>
            <div class="form-group">
                {*<label for="end-date"><span class="glyphicon glyphicon-resize-horizontal"></span></label>*}
                <input class="form-control input-sm interval-date" id="end-date-0" type="date">
            </div>
        </form>
        </div>
        <!-- Тут список событий -->
        <div class="panel panel-default events-list" id='events-list-0'>
                {*<div class="panel-heading">
                    <h4 class="panel-title">
                      <a data-toggle="collapse" href="#collapse1">04.03.2018</a>
                    </h4>
                </div>
                <div id="collapse1" class="panel-collapse collapse in">
                    <div class="list-group">
                        <a href="#" class="list-group-item event" id="event-44">
                            <strong>22:15</strong> Comment
                                 Примечание</a>
                        <a href="#" class="list-group-item event event-normal" id="event-54">
                            <strong>22:20 СК 5.6</strong> <i>Всё будет хорошо...</i></a>
                        
                        <a href="#" class="list-group-item event event-warning" id="event-34">
                            <strong>22:30 СК 7.8</strong><br> Угл 54 Ккал 446 
                            КД 5.6 ДПС 1.3<br>
                            <i>Всё будет хорошо...</i></a>
                    </div>
                </div>

                <div class="panel-heading">
                    <h4 class="panel-title">
                      <a data-toggle="collapse" href="#collapse2">05.03.2018</a>
                    </h4>
                </div>
                <div id="collapse2" class="panel-collapse collapse in">
                    <ul class="list-group">
                      <li class="list-group-item">One</li>
                      <li class="list-group-item">Two</li>
                      <li class="list-group-item">Three</li>
                    </ul>
                </div>*}
        </div>
    </div> <!-- table column -->
    <div class="col-sm-6 hidden-page pages" id="page-1"> <!-- графики -->
        <button type="button" class="btn btn-sm" id="collapse-all-btn-1" title="Закрыть или раскрыть">
            <span class="glyphicon glyphicon-resize-vertical"></span></button>
        <button type="button" class="btn btn-warning  btn-sm pull-right" id="remove-page-btn-1" title="Удалить страницу">
            <span class="glyphicon glyphicon-remove"></span></button>
        <form class="form-inline">
            <div class="form-group">
                {*<label for="focusedInput">От:</label>*}
                <input class="form-control input-sm interval-date" id="start-date-1" type="date">
            </div>
            <div class="form-group">
                {*<label for="end-date"><span class="glyphicon glyphicon-resize-horizontal"></span></label>*}
                <input class="form-control input-sm interval-date" id="end-date-1" type="date">
            </div>
        </form>
        <!-- Тут список событий -->
        <div class="panel panel-default events-list" id='events-list-1'>

        </div>
    </div>
    <div class="col-sm-4 hidden-page pages" id="page-2"> <!-- графики -->
        <button type="button" class="btn btn-sm" id="collapse-all-btn-2" title="Закрыть или раскрыть">
            <span class="glyphicon glyphicon-resize-vertical"></span></button>
        <button type="button" class="btn btn-warning  btn-sm pull-right" id="remove-page-btn-2" title="Удалить страницу">
            <span class="glyphicon glyphicon-remove"></span></button>
        <form class="form-inline">
            <div class="form-group">
                {*<label for="focusedInput">От:</label>*}
                <input class="form-control input-sm interval-date" id="start-date-2" type="date">
            </div>
            <div class="form-group">
                {*<label for="end-date"><span class="glyphicon glyphicon-resize-horizontal"></span></label>*}
                <input class="form-control input-sm interval-date" id="end-date-2" type="date">
            </div>
        </form>
        <!-- Тут список событий -->
        <div class="panel panel-default events-list" id='events-list-2'>

        </div>
    </div>
</div> <!--Конец главного row -->

<!-- Dialogs -->
{*Диалог для добавления и редактирования СК или комментария *}
<div id="event-dialog" class="modal fade" role="dialog">
    <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title" id="event-dlg-header"></h4>
      </div>
        <div class="modal-body">
            <div class="form-group row">
                <div class="col-xs-6">
                    <label for="event-dlg-date">Дата:</label>
                    <input class="form-control" id="event-dlg-date" type="date">
                </div>
                <div class="col-xs-3">
                    <label for="event-dlg-time">Время:</label>
                    <input class="form-control" id="event-dlg-time" type="time">
                </div>
                <div class="col-xs-3" id="event-dlg-sh-view">
                    <label for="event-dlg-sh">СК:</label>
                    <input class="form-control select-all" id="event-dlg-sh" type="number" size="4" 
                           step="{if $settings.mmol}0.1{else}1{/if}">
                </div>
            </div>
            <div class="form-group">
              <label for="event-dlg-remark">Комментарий:</label>
              <textarea class="form-control" rows="2" id="event-dlg-remark"></textarea>
            </div>
        </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" id="event-dlg-okay">
            Okay</button>
        <button type="button" class="btn btn-primary" data-dismiss="modal">
            Отмена</button>
        <button type="button" class="btn btn-danger" data-dismiss="modal" id='event-dlg-delete'>
            Удалить</button>
      </div>
    </div>
    </div>
</div>
{*Диалог меню*}
<div id="menu-dialog" class="modal fade" role="dialog">
    <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Сохранённое меню</h4>
      </div>
        <div class="modal-body">
            <div class="row">
                <div class='col-sm-4'>
                    <div class="form-group">
                        <p class="form-control-static dose-res-bigger" id="menu-dlg-datetime"></p>
                    </div>
                </div>
                <div class='col-sm-8'>
                    <p id="menu-dlg-remark"></p>
                </div>
            </div>
            <div class='row'>
                <div class='col-sm-7'>
                    <ul class="list-group" id="menu-dlg-preview">
                      {*<li class="list-group-item ">First item, looooong name, tooooo long name
                          <span class="badge">125 гр.</span></li>
                      <li class="list-group-item ">Second item 
                            <span class="badge">125 гр.</span></li>
                      <li class="list-group-item ">Third item 
                            <span class="badge">125 гр.</span></li>*}
                    </ul>
                </div>
                <div class='col-sm-5'>
                    <table class='menu-dlg-table'>
                        <tbody>
                            <tr>
                                <td><sub>К1</sub>
                                    <span class='dose-res-bigger' id="menu-dlg-k1"></span></td>
                                <td><sub>К2</sub>
                                    <span class='dose-res-bigger' id="menu-dlg-k2"></span></td>
                                <td><sub>ЦЕИ</sub>
                                    <span class='dose-res-bigger' id="menu-dlg-k3"></span></td>
                            </tr>
                            <tr>
                                <td><sub>СК1</sub>
                                    <span class='dose-res-bigger' id="menu-dlg-sh1"></span></td>
                                <td><sub>СК2</sub>
                                    <span class='dose-res-bigger' id="menu-dlg-sh2"></span></td>
                                <td><sub>ХЕ</sub>
                                    <span class='dose-res-bigger' id="menu-dlg-be"></span></td>
                            </tr>
                        </tbody>
                    </table>
                    <hr>
                    <table class='menu-dlg-table'>
                    <tbody>
                    <tr>
                        <td title='Доза на ДПС и быстрые углеводы'>
                            <sub>БД</sub><span id="menu-dlg-dose-quick" class="dose-res-bigger"></span></td>
                        <td rowspan="2">+</td>
                        <td title='Доза на медленные углеводы, белки и жиры'>
                            <sub>МД</sub><span id="menu-dlg-dose-slow" class="dose-res-bigger"></span></td>
                        <td rowspan='2' >
                            = <span title='Вся доза'><sub>Σ</sub>
                                <span id="menu-dlg-dose-whole" class="dose-res-bigger"></span></td>
                    </tr>
                    <tr>
                        <td title='ДПС'><sub>ДПС</sub>
                                <span class="dose-res-bigger" id="menu-dlg-dose-dps"></span></td>
                        <td title='Компенсационная доза'><sub>КД</sub>
                                <span class="dose-res-bigger" id="menu-dlg-dose-kd"></span></td>
                    </tr>
                    </tbody>
                    </table>
                    <hr>
                    <table class='menu-dlg-table' id="results-table">
                        <tbody><tr><td>Б</td><td>Ж</td><td>У</td><td>ГИ</td><td>Калор</td><td>ХЕ</td></tr>
                            <tr>
                                <td class="dose-res-bigger" id="menu-dlg-prot"></td>
                                <td class="dose-res-bigger" id="menu-dlg-fat"></td>
                                <td class="dose-res-bigger" id="menu-dlg-carb"></td>
                                <td class="dose-res-bigger" id="menu-dlg-gi"></td>
                                <td class="dose-res-bigger" id="menu-dlg-calor"></td>
                                <td class="dose-res-bigger" id="menu-dlg-be-amount"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" id="menu-dlg-restore">
            Восстановить</button>
        <button type="button" class="btn btn-primary" data-dismiss="modal">
            Отмена</button>
        <button type="button" class="btn btn-danger" data-dismiss="modal" id='menu-dlg-delete'>
            Удалить</button>
      </div>
    </div>
    </div>
</div>
<div id="calor-info-dialog" class="modal fade" role="dialog">
    <div class="modal-dialog">
    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Информация по калорийности за <span id="calor-info-dlg-date"></span></h4>
      </div>
        <div class="modal-body">
            <div class="row">
                <div class="col-sm-4"></div>
                <div class="col-sm-8">
                    <h5>Употреблено питательных веществ, а так же их влияние на калорийность.</h5>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-4">
                    <table class="menu-dlg-table table-striped-horizontal"><tbody>
                        <tr><td>Съедено</td><td class="results" id="calor-info-dlg-eaten"></td></tr>
                        <tr><td>Лимит</td><td class="results">{$settings.calorlimit}</td></tr>
                    </tbody></table>
                </div>
                <div class="col-sm-8">
                    <table class='menu-dlg-table table-striped-horizontal'><tbody>
                    <tr><td></td><td>Б</td><td>Ж</td><td>У</td></tr>
                    <tr>
                        <td>Всего</td>
                        <td class="results" id="calor-info-dlg-prot"></td>
                        <td class="results" id="calor-info-dlg-fat"></td>
                        <td class="results" id="calor-info-dlg-carb"></td>
                    </tr>
                    <tr>
                        <td>100%=</td>
                        <td class="results" id="calor-info-dlg-pcnt-prot"></td>
                        <td class="results" id="calor-info-dlg-pcnt-fat"></td>
                        <td class="results" id="calor-info-dlg-pcnt-carb"></td>
                    </tr>
                </tbody></table>
                </div>
            </div>
        </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">
            Okay</button>
      </div>
    </div>
    </div>
</div>
<!-- Конец диалогов -->
</div><!-- Конец контейнера main -->


{include file='footer_d.tpl'}