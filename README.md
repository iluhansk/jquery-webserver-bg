jquery-webserver-bg
===================
jquery plugin for operate with long-time webserver background processes

Installation
------------

The preferred way to install this extension is through [composer](http://getcomposer.org/download/).

Either run

```
php composer.phar require --prefer-dist iluhansk/jquery-webserver-bg "*"
```

or add

```
"iluhansk/jquery-webserver-bg": "*"
```

to the require section of your `composer.json` file.


Usage
-----

First of all, add jquery.js and jquery.webserver-bg.js to source files of html page:

```
<script src="path/to/jquery.js"></script>
<script src="path/to/jquery.webserver-bg.js"></script>
```

Init plugin via javascript:

$('.myForm').webserverBackground(options);

Options
-------

| option | description |
|--------|-------------|
| start  |options of starting background process|
| start.ajax  |ajax options (see jQuery.ajax() options)|
| start.getData  |A function generating data option of ajax settings|
| check  |options of checking process status |
| check.ajax  |ajax options (see jQuery.ajax() options)|
| check.delay  |Count seconds between check requests|
| error  |options of error processing|
| error.container  |Error container jquery selector |
| error.template  |Error container template|
| error.print  |A function that print error |
| error.clear  |A function that clear error|
| success|A function to be called if the process succeeds|
| complete|A function to be called when the process finishes (after success and error callbacks are executed)|
| progress|options of displaying process progress |
| progress.container  |progress container jquery selector |
| progress.template  |progress container template|
| progress.print  |A function that print progress |
| json  |settings of http json response |
| json.fields  |json fields |
| json.statuses  |statuses of process |

Methods
-------

call methods like this:

```
$('.myForm').webserverBackground(method, options);
```

| method | description |
|--------|-------------|
| init  | initialize plugin (default method)|
| destroy  | destroy plugin |
| start  | start background process and checking workflow |
| block  | disable form elements |
| unblock  | enable form elements |
