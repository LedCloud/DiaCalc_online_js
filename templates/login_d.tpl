{* Smarty *}
{include file='header_d.tpl'}
<link rel="stylesheet" type="text/css" href="css/login.css" />
</head>
<body>
<div class="container">
    
  
  <form method="post" action="login.php?{$sid}" class="form-signin">
    <h3 class="form-signin-heading">Авторизируйтесь</h3>
    <label for="login" class="sr-only">Логин:</label>
    <input type="text" class="form-control" id="login" name="login" 
           placeholder="Логин" required="" autofocus="" value="{if isset($login)}{$login}{/if}">
    <label for="passwd" class="sr-only">Пароль:</label>
    <input type="password" class="form-control" name="passwd" id="passwd" placeholder="Пароль" required="">
    
    <button type="submit" name="send" class="btn btn-lg btn-primary btn-block">Вход</button>
    
    {if isset($errors)}<div class="alert alert-warning">
        <h4>Произошли следующие ошибки:</h4>
        <ul>
        {foreach from=$errors item=error}
        <li>{$error}</li>
        {/foreach}
        </ul>
        </div>
    {/if}
    <hr>
    <p class="text-center"><a href="recovery.php?{$sid}" >Забыли пароль?</a></p>
    
    
    <a href="join.php?{$sid}" class="btn btn-lg btn-default btn-block">Регистрирация новой учетной записи</a>
  </form>
    
</div>    
<!-- Bootstrap core JavaScript
================================================== -->
<!-- Placed at the end of the document so the pages load faster -->
<!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
<script src="js/ie10-viewport-bug-workaround.js"></script>
{include file='footer_d.tpl'}