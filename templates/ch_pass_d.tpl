{* Smarty *} 
{include file='header_d.tpl'}
<link rel="stylesheet" type="text/css" href="css/login.css" />
</head>
<body>
<div class="container">
  {if isset($success)}
      <div class="form-signin alert alert-success">
      <h4>Пароль успешно изменен</h4>
      <p>Пользователи на всех других устройствах будут разлогинены</p>
      <a href="index.php?{$sid}" class="btn btn-lg btn-default btn-block" role="button">
          <span class="glyphicon glyphicon-home"></span> Вернуться</a>
      </div>
  {else}
    <form method="post" action="changepass.php?{$sid}" class="form-signin">
            <h3 class="form-signin-heading">Смена пароля</h3>
            {if isset($message)}
            <div class="alert alert-info">
                <p>{$message}</p>
            </div>
            {/if}
            <label for="old_passwd" class="sr-only">Старый пароль:</label>
            <input type="password" name="old_pass" placeholder="Старый пароль" class="form-control" required="" autofocus="" id="old_pass">
            
            <label for="passwd1" class="sr-only">Новый пароль:</label>
            <input type="password" name="passwd1" placeholder="Новый пароль" class="form-control" required="" id="passwd1">
            
            <label for="passwd2" class="sr-only">Повторите новый пароль:</label>
            <input type="password" name="passwd2" placeholder="Повторите новый пароль" class="form-control" required="" id="passwd2">
        
            <button type="submit" name="send" class="btn btn-lg btn-primary btn-block">Изменить</button>
            <a href="index.php?{$sid}" class="btn btn-lg btn-default btn-block" role="button">Отмена</a>
            {if isset($errors)}<div class="alert alert-warning">
                <h4>Произошли следующие ошибки:</h4>
                <ul>
                {foreach from=$errors item=error}
                <li>{$error}</li>
                {/foreach}
                </ul>
                </div>
            {/if}
    </form>
   {/if}
</div>
<!-- Bootstrap core JavaScript
================================================== -->
<!-- Placed at the end of the document so the pages load faster -->
<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
<script src="js/ie10-viewport-bug-workaround.js"></script>  
{include file='footer.tpl'}
