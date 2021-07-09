{* Smarty *} 
{include file='header.tpl'}
<script src="js/functions.js?18092018"></script>
<script src="js/groups.js?01112018"></script>
</head>
<body oncontextmenu="return false;">


<div data-role="page" id="gr-page-mgr">
  <div data-role="header" data-position="fixed">
      <a href="index.php?{$sid}" class="ui-btn ui-corner-all ui-btn-inline ui-btn-icon-left ui-icon-home ui-shadow" data-ajax="false">Домой</a>
      <h3>Группы</h3>
    <a href="#" id="gr-del-btn" data-rel="popup" data-position-to="window" data-transition="pop" class="ui-btn-right ui-corner-all ui-shadow ui-btn ui-btn-inline ui-btn-icon-right ui-icon-delete">Удал.</a>
    <div data-role="navbar"  data-iconpos="left">
	<ul>
            <li><button id="gr-add-btn" data-icon="plus" class="ui-shadow ui-corner-all">Новая</button></li>
            <li><button id="gr-edit-btn" data-icon="edit" class="ui-shadow ui-corner-all">Изм</button></li>
            <li><button id="gr-up-btn" data-icon="arrow-u" class="ui-shadow ui-corner-all">Вверх</button></li>
            <li><button id="gr-down-btn" data-icon="arrow-d" class="ui-shadow ui-corner-all">Вниз</button></li>
	</ul>
    </div><!-- /navbar -->
  </div> <!-- header -->
  <div data-role="main" class="ui-content">
    <ul data-role="listview" id="gr-list-mgr">
        {if isset($groups)}
            {foreach from=$groups item=gr}
                <li id="gr{$gr.id}">
                    <a href="#" class="gr-in-list ui-btn ui-btn-icon-none ui-icon-carat-r">
                        {$gr.name}<span class="ui-li-count">{$gr.prPgr}</span></a></li>
            {/foreach}
        {/if}
    </ul>
  </div> <!-- content -->
{*Диалог удаления группы*}
<div data-role="popup" id="delDialog" data-overlay-theme="b" data-theme="b" data-dismissible="false" style="max-width:400px;">
    <div data-role="header" data-theme="a">
    <h1>Удаление</h1>
    </div>
    <div data-role="main" class="ui-content">
        <h3 class="ui-title">Удалить группу продуктов?</h3>
        <p id="gr-name"></p>
        <p id="gr-info">Продуктов в группе <span id="gr-products"></span></p>
        <a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Отмена</a> 
        <a href="#" id="del-gr-ok" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Удалить</a>
    </div>
</div>
{*Диалог добавления/изменения группы*}
<div data-role="popup" id="groupDialog" data-overlay-theme="b" data-theme="a">
    <div style="padding:10px 20px;">    
        <h3>Новая группа</h3>
        <label for="groupName" class="ui-hidden-accessible">Группа:</label>
        <input type="text" name="user" id="groupName" data-clear-btn="true" value="" placeholder="название" data-theme="a">
        <a href="#" id="btn-gr-cancel" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Отмена</a> 
        <a href="#" id="btn-gr-ok" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Добавить</a>
    </div>
</div>
{*Диалог изменения группы*}
{*<div data-role="popup" id="editDialog" data-overlay-theme="b" data-theme="a">
    <div style="padding:10px 20px;">    
        <h3>Изм. группу</h3>
        <label for="newGrName" class="ui-hidden-accessible">Группа:</label>
        <input type="text" name="user" id="editGrName" data-clear-btn="true" value="" placeholder="название" data-theme="a">
        <a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Отмена</a> 
        <a href="#" id="edit-gr-ok" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Изменить</a>
    </div>
</div>     *}

</div>
    


 
        
{include file='footer.tpl'}
