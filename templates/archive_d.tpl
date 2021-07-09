{* Smarty *} 
{include file='header_d.tpl'}
<link rel="stylesheet" type="text/css" href="css/archive_d.css?22102018" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>
<script src="js/BootstrapMenu.min.js"></script>
<script src="js/classes.js?01112018"></script>
<script src="js/functions.js?01102018"></script>
<script src="js/jquery.scrollTo-min.js"></script>
<script src="js/archive_d.js?01112018"></script>
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
      <a class="navbar-brand" href="#">DiaCalc online &bull; Архив</a>
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
             <li><a href="diary.php?{$sid}"><span class="glyphicon glyphicon-book"></span> Дневник</a></li>
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
<div class="row">
    <div class="col-sm-4"><!--Группы-->
            <!--Группы-->
            <ul class="list-group" id="groups-list" title='Группы'>
            {if $arc_groups}
                {foreach from=$arc_groups item=gr}
                   <li id="gr{$gr.id}" class="list-group-item group-item">{$gr.name}</li>
                {/foreach}
            {/if}
            </ul>
        </div>
        <div class="col-sm-8"><!--Продукты-->
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
    <ul class="list-group" id="prods-list" title='Продукты'>
    </ul>    
            
    </div>
</div>
<div id="message-alert" class="alert alert-success fade">
    <button type="button" class="close" data-dismiss="alert">×</button>
    <strong>Продукт добавлен в рабочую базу!</strong>
</div>      
<!--Конец главного row -->
<!-- Dialog -->
{*Диалог для добавления продукта в базу пользователя*}
<div id="add-prod-dialog" class="modal fade" role="dialog">
    <div class="modal-dialog">
    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Добавление продукта в базу пользователя</h4>
      </div>
        <div class="modal-body">
            <h4 id="add-prod-dlg-name"></h4>
            <p>Б: <span id="add-prod-dlg-prot" class="bigger"></span> 
               Ж: <span id="add-prod-dlg-fat" class="bigger"></span> 
               У: <span id="add-prod-dlg-carb" class="bigger"></span> 
               ГИ: <span id="add-prod-dlg-gi" class="bigger"></span></p>
            <div class="form-group">
              <label for="add-prod-dlg-select-group">Выберите группу:</label>
              <select class="form-control" id="add-prod-dlg-select-group">
                    {if $groups}
                    {foreach from=$groups item=gr}
                            {if $gr.id!=0}
                            <option value="{$gr.id}">{$gr.name}</option>
                            {/if}
                        {/foreach}
                    {/if}
              </select>
            </div>
        </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" id="add-prod-dlg-okay">
            Okay</button>
        <button type="button" class="btn btn-primary" data-dismiss="modal">
            Отмена</button>
      </div>
    </div>
    </div>
</div>
</div><!-- Конец контейнера main -->


{include file='footer_d.tpl'}