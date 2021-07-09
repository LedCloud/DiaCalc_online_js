{* Smarty *} 
{include file='header_d.tpl'}
<link rel="stylesheet" type="text/css" href="css/main_d.css?22102018" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
<script src="js/BootstrapMenu.min.js"></script>
<script src="js/classes.js?01112018"></script>
<script src="js/functions.js?01102018"></script>
<script src="js/jquery.scrollTo-min.js"></script>
<script src="js/main_d.js?03042019"></script>
<script>
    var settings ={ldelim}
        menuinfo: {$settings.menuinfo},
        roundto : {$settings.roundto},
        whole   : {$settings.whole},
        mmol    : {$settings.mmol},
        shtarget: {$settings.shtarget},
        filteroff:{$settings.filteroff},
        timedcoefs:{$settings.timedcoefs},
        calorlimit:{$settings.calorlimit},
        eaten   :{$settings.eaten},
        eatenDt :new Date('{$settings.eatendate}')
    {rdelim}; 
    var target = new Sugar(settings.shtarget);
    {if $coefs}
    var coefsArr = [ 
        {foreach from=$coefs item=cf}
            {ldelim} time: "{$cf.time}",
                     k1  : {$cf.k1},
                     k2  : {$cf.k2},
                     k3  : {$cf.k3}
            {rdelim},
        {/foreach} ];
        
    {/if}
    var target = new Sugar({$settings.shtarget});
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
      <a class="navbar-brand" href="#">DiaCalc online</a>
    </div>
    <div class="collapse navbar-collapse" id="myNavbar">
    <ul class="nav navbar-nav">
      <li><a href="diary.php?{$sid}"><span class="glyphicon glyphicon-book"></span> Дневник</a></li>
      <li><a href="coefs.php?{$sid}"><span class="glyphicon glyphicon-list-alt"></span> Коэффициенты</a></li>
    </ul>
    <ul class="nav navbar-nav">
	<li class="dropdown">
	  <a class="dropdown-toggle" data-toggle="dropdown" href="#"><span class="glyphicon glyphicon-cog"></span> Дополнительно
           <span class="caret"></span></a>
            <ul class="dropdown-menu">      
	     <li><a href="archive.php?{$sid}"><span class="glyphicon glyphicon-briefcase"></span> Архив</a></li>
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
  <div class="col-sm-5"><!-- menu column -->
    <div class="row" id='menu-view'>
        <div class="row" id='top-menu'> <!-- Menu menu -->
                <a href="#" class="btn btn-default btn-sm" title="Создать новый продукт" id='create-prod-from-menu'>
                    <span class="glyphicon glyphicon-plus"></span></a>
                <a href="#" class="btn btn-default btn-sm" title="Сохранить в дневник" id='store-menu-to-diary'>
                    <span class="glyphicon glyphicon-pencil"></span></a>
                {if $settings.calorlimit>0}
                <a href="#" class="btn btn-default btn-sm" title="Информация по употребленным калориям" 
                   id='calor-progressbar'>
                    <strong><span id='calor-eaten'></span> / {$settings.calorlimit}</strong></a>
                {/if}
                <a href="#" class="btn btn-default btn-sm pull-right" title="Очистить меню" id="btn-flush-menu">
                    <span class="glyphicon glyphicon-trash"></span></a>
        </div>
        <div class="row">
        <ul class="list-group" id='menu-list' title='Меню'
            ondrop="dropMenu(event);" ondragover="allowDrop(event);">{*тут строки меню*}
        </ul>
        </div>
    </div>
    <div class='row' id='results-view'>
        <div class='col-xs-10  padding-sm'>
            
            <!-- Тут рисуем коэффициенты -->
            <div id='coefs-view'>
             
                <form class="form-horizontal">
                    {if $coefs}
                    <!--select с коэф-ми -->
                    <select id="coefs-choice" class="form-control selector-not-in-use">
                        {if $settings.timedcoefs}
                            {for $i=0 to 23}
                                <option value="{$i}">{if $i<10}0{/if}{$i}:00 k1={$coefs[$i].k1} k2={$coefs[$i].k2} ЦЕИ={$coefs[$i].k3}</option>
                            {/for}
                        {else}
                            {for $i=1 to count($coefs)}
                                <option value="{$i-1}">k1={$coefs[$i-1].k1} k2={$coefs[$i-1].k2} ЦЕИ={$coefs[$i-1].k3}</option>
                            {/for}
                        {/if}
                    </select>
                    {/if}
                    <div class="row form-group">
                        <label class="control-label col-xs-1" for="k1">k1:</label>
                        <div class="col-xs-3">          
                            <input type="number" class="form-control infloat " id="k1" step="0.01">
                        </div>
                        <label class="control-label col-xs-1" for="k2">k2:</label>
                        <div class="col-xs-3">          
                            <input type="number" class="form-control infloat" id="k2" step="0.01">
                        </div>
                        <label class="control-label col-xs-1" for="k3">ЦЕИ:</label>
                        <div class="col-xs-3">          
                            <input type="number" class="form-control infloat" id="k3" step="{if $settings.mmol}0.1{else}1{/if}">
                        </div>
                    </div>
                    <div class="row form-group">
                        <label class="control-label col-xs-1" for="sh1">СК1:</label>
                        <div class="col-xs-3">          
                            <input type="number" class="form-control infloat" id="sh1" step="{if $settings.mmol}0.1{else}1{/if}">
                        </div>
                        <label class="control-label col-xs-1" for="sh2">СК2:</label>
                        <div class="col-xs-3">          
                            <input type="number" class="form-control infloat" id="sh2" step="{if $settings.mmol}0.1{else}1{/if}">
                        </div>
                        <label class="control-label col-xs-1" for="be">ХЕ:</label>
                        <div class="col-xs-3">          
                            <input type="number" class="form-control infloat" id="be" step="1">
                        </div>
                    </div>
               </form>
               <div class="panel panel-default">
                <div class="panel-body">
                    <table width="100%" style="padding-bottom: 5px;">
                    <tbody>
                    <tr class='show-hidden-results'>
                        <td style='text-align: center;' title='Доза на ДПС и быстрые углеводы'>
                            <sub>БД</sub><strong id="dose-quick" class="dose-res-bigger"></strong></td>
                        <td rowspan="3">+</td>
                        <td style='text-align: center;' title='Доза на медленные углеводы, белки и жиры'>
                            <sub>МД</sub><strong id="dose-slow" class="dose-res-bigger"></strong></td>
                        <td rowspan='3' style='text-align: center;'>
                            = <span title='Вся доза'><sub>Σ</sub>
                                <strong id="dose-whole" class="dose-res-bigger"></strong></span></td>
                    </tr>
                    <tr class='results-hidden'>
                        <td style='text-align: center;'>(<span title='ДПС'><sub>ДПС</sub><strong class="dose-dps"></strong></span></span> + 
                            <span title='Доза на быстрые углеводы'><sub>БДугл</sub><strong id="dose-carb-q"></strong></span>)</td>

                        <td style='text-align: center;'>(<span title='Доза на медленные углеводы'><sub>МДугл</sub><strong id="dose-carb-sl"></strong></span> + 
                            <span title='Доза на белки и жиры'><sub>МДбж</sub><strong class="dose-protfat"></strong></span>)</td>
                    </tr>
                    <tr class='results-hidden'>
                        <td style='text-align: center;'>(<span title='ДПС'><sub>ДПС</sub><strong class="dose-dps"></strong></span> + 
                            <span title='Доза на углеводы'><sub>УГЛ</sub><strong id="dose-carb"></strong></span>)</td>

                        <td style='text-align: center;'>(
                            <span title='Доза на белки и жиры'><sub>БЖ</sub><strong class="dose-protfat"></strong></span>)</td>
                    </tr>
                    </tbody>
                    </table>
                </div>
               </div>
            </div><!-- coef-view-->
        </div>
        <div class='col-xs-2  padding-sm'> <!--Информация о БЖУ -->
            <div class="panel panel-default">
                <div class="panel-body">
                    <table>
                    <tbody class="results-table">
                    <tr title='Количество белков'>
                        <td>Б:</td><td id="info-prot"></td> </tr>
                    <tr title='Количество жиров'>
                        <td>Ж:</td><td id="info-fat"></td></tr>
                    <tr title='Количество углеводов'>
                        <td>У:</td><td id="info-carb"></td></tr>
                    <tr title='Гликемический индекс'>
                        <td>ГИ:</td><td id="info-gi"></td>
                    </tr>
                    <tr title='Калорийность'>
                        <td>Кк:</td><td id="info-calor"></td>
                    </tr>
                    <tr title='Гликемическая нагрузка'>
                        <td>ГН:</td><td id="info-gn"></td>
                    </tr>
                    <tr title='Количество хлебных единиц'>
                        <td>ХЕ:</td><td id="info-be-amount"></td>
                    </tr>
                    </tbody>
                    </table>
                </div>
            </div>
        </div> 
    </div> <!-- results+coef views--> 
    <!-- Тут будет градусник -->
    <div class="progress" title="Распределение в % по калорийности" id='ruler'>
        <div class="progress-bar progress-bar-default progress-bar-striped" role="progressbar" 
             id="ruler-prot">
          Белки
        </div>
        <div class="progress-bar progress-bar-warning" role="progressbar" 
             id="ruler-fat">
          Жиры
        </div>
        <div class="progress-bar progress-bar-primary" role="progressbar" 
             id="ruler-carb">
          Углеводы
        </div>
    </div>
  </div> <!-- menu column -->
 

<!-- </div><!-- main row -->

<div class="col-sm-7"> <!-- отдельный ряд для групп и продуктов -->
    <div class="row">
        <div class="col-sm-5"><!--Группы-->

<!--Группы-->
    <div id="groups-buttons">
        <button type="button" class="btn btn-default" id="create-group">
            <span class="glyphicon glyphicon-plus"></span></button>   
        <button type="button" class="btn btn-default" id="edit-group">
            <span class="glyphicon glyphicon-edit"></span></button>
        <button type="button" class="btn btn-default" id="group-up">
            <span class="glyphicon glyphicon-arrow-up"></span></button>
        <button type="button" class="btn btn-default" id="group-down">
            <span class="glyphicon glyphicon-arrow-down"></span></button>
        <button type="button" class="btn btn-default pull-right" id="delete-group">
        <span class="glyphicon glyphicon-remove"></span></button>
    </div>
    <ul class="list-group" id="groups-list" title='Группы' ondrop="dropGroup(event);" ondragover="allowDrop(event);">
    {if $groups}
        {foreach from=$groups item=gr}
           <li id="gr{$gr.id}" class="list-group-item group-item">{$gr.name}</li>
        {/foreach}
    {/if}
    </ul>

            
        </div>
        <div class="col-sm-7"><!--Продукты-->

<!-- Продукты -->
    <form  id="navBarSearchForm">
        <div class="input-group">
          <input type="text" class="form-control" placeholder="Поиск" 
                   id="base-search" name="base-search">
          <div class="input-group-btn">
            <button class="btn btn-default" type="reset">
                    <i class="glyphicon glyphicon-remove"></i></button>
          </div>
        </div>
    </form>
    
    <div id="groups-buttons">
        <button type="button" class="btn btn-default" id="create-prod">
            <span class="glyphicon glyphicon-plus"></span></button>   
        <button type="button" class="btn btn-default" id="edit-prod">
            <span class="glyphicon glyphicon-edit"></span></button>
        
        <button type="button" class="btn btn-default pull-right" id="delete-prod">
        <span class="glyphicon glyphicon-remove"></span></button>
    </div>

    <ul class="list-group" id="prods-list" title='Продукты'>
    </ul>    
            
        </div>
    </div>
</div>
</div> <!--Конец главного row -->
<!-- Dialogs -->
<div id="dlg-add-edit-group" class="modal fade" role="dialog">
    <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title" id="dlg-grp-header"></h4>
      </div>
      <div class="modal-body">
        <div class="form-group">
            <label for="grp-dlg-name">Имя группы:</label>
            <input type="text" class="form-control" id="grp-dlg-name" placeholder="Группа" required="" autofocus="" value="">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" id="grp-add-edit-ok">Да</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>
      </div>
    </div>

    </div>
</div>
{*dialog delete group*}
<div id="dlg-del-group" class="modal fade" role="dialog">
    <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title" id="dlg-grp-header">Удаление группы</h4>
      </div>
      <div class="modal-body">
          <p>Вы собрались удалить группу <strong><span id="dlg-del-grp-name"></span></strong></p>
          <p>Вместе с группой будут удалены все входящие в неё продукты</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" id="grp-del-ok">Удалить</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>
      </div>
    </div>
    </div>
</div>
{*dialog delete product*}
<div id="dlg-del-product" class="modal fade" role="dialog">
    <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title" id="dlg-prod-header">Удаление продукта</h4>
      </div>
      <div class="modal-body">
          <p>Вы собрались удалить продукт <strong><span id="dlg-del-prod-name"></span></strong></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" id="dlg-prod-del-ok">
            Удалить</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>
      </div>
    </div>
    </div>
</div>
{*round dialog*}
<div id="round-weight-product" class="modal fade" role="dialog">
    <div class="modal-dialog">
    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Округление дозы</h4>
      </div>
      <div class="modal-body">
          <p>Округлить дозу инсулина, изменив вес продукта:<br>
              <strong><span id="dlg-round-prod-name"></span></strong></p>
          <p>К текущему весу продукта <span id="dlg-round-weight-current"></span> гр. 
              нужно прибавить <span class="dlg-round-add-text"></span> гр. или отнять 
              <span class="dlg-round-substruct-text"></span> гр.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" id="dlg-round-weight-add">
            Прибавить: <span class="dlg-round-add-text"></span> гр.</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>
        <button type="button" class="btn btn-primary" data-dismiss="modal" id="dlg-round-weight-substruct">
            Убавить: <span class="dlg-round-substruct-text"></span> гр.</button>
      </div>
    </div>
    </div>
</div>
{*product dialog*}
<div id="product-dialog" class="modal fade" role="dialog">
    <div class="modal-dialog">
    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title" id="product-dialog-header">Новый продукт</h4>
      </div>
      <div class="modal-body">
          <div class="form-group">
                  <label class="control-label" for="product-dialog-prod-name">Наименование:</label>
                  <input type="text" class="form-control" id="product-dialog-prod-name" placeholder="Введите наименование">
          </div>
          <form class="form-horizontal">
          <div class="form-group">
              <div class="col-sm-2">          
                <label class="control-label" for="product-dialog-prod-prot">Б:</label>
                <input type="number" class="form-control" id="product-dialog-prod-prot" placeholder="гр." step="0.1">
              </div>
              <div class="col-sm-2">          
                <label class="control-label" for="product-dialog-prod-fat">Ж:</label>
                <input type="number" class="form-control" id="product-dialog-prod-fat" placeholder="гр." step="0.1">
              </div>
              <div class="col-sm-2">
                <label class="control-label" for="product-dialog-prod-carb">У:</label>
                <input type="number" class="form-control" id="product-dialog-prod-carb" placeholder="гр." step="0.1">
              </div>
              <div class="col-sm-2">          
                <label class="control-label" for="product-dialog-prod-carb">ГИ:</label>
                <input type="number" class="form-control" id="product-dialog-prod-gi" placeholder="%" step="1">
              </div>
              <div class="col-sm-4">
                <label class="control-label" for="product-dialog-prod-carb">Вес:</label>
                <input type="tel" class="form-control product-dlg-weight-input" id="product-dialog-prod-weight" placeholder="гр." step="1">
              </div>
          </div>
          </form>
          <div class="form-group">
            <label for="product-dialog-select-group">Выберите группу:</label>
            <select class="form-control" id="product-dialog-select-group">
            </select>
           </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" {*data-dismiss="modal"*} id="product-dialog-btn-ok">Добавить</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>
      </div>
    </div>
    </div>
</div>
        
{*Диалог для сохранения в дневник *}
<div id="event-dialog" class="modal fade" role="dialog">
    <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Сохранение меню в дневник</h4>
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
      </div>
    </div>
    </div>
</div>
<div class="modal fade" id="calor-info-dialog" role="dialog">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal">&times;</button>
          <h4 class="modal-title">Счетчик</h4>
        </div>
        <div class="modal-body">
          <p>Счетчик суточных калорий</p>
            <table width="100%" class="table-striped"><tbody>
                    <tr><td>Набрано</td><td></td><td>В меню</td><td></td><td>Всего</td><td>Лимит</td>
                    </tr>
                    <tr>
                        <td id='calor-info-dlg-eaten' class="results"></td>
                        <td>+</td>
                        <td id='calor-info-dlg-menu' class="results"></td>
                        <td>=</td>
                        <td id='calor-info-dlg-sum' class="results"></td>
                        <td class="results">{$settings.calorlimit}</td>
                    </tr>
            </tbody></table>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-dismiss="modal">Okay</button>
        </div>
      </div>
    </div>
</div>
<div id="message-alert" class="alert alert-success fade">
    <button type="button" class="close" data-dismiss="alert">×</button>
    <strong id="message-alert-text"></strong>
</div>
</div><!-- Конец контейнера main -->


{include file='footer_d.tpl'}