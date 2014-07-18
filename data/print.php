<?php
	$dir = scandir('../imgs/items/');
	for ($i=0; $i < count($dir); $i++) { 
		echo $dir[$i] . '<br>';
	}
?>