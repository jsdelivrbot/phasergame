<?php
	$json = [];

	$con = mysqli_connect('localhost','admin','bionicle13','MMO');

	if ($con)
	{
		$result = mysqli_query($con,'SELECT * FROM islands');

		// Fetch all
		$json = mysqli_fetch_all($result,MYSQLI_ASSOC);

		//get the maps
		for ($i=0; $i < count($json); $i++) { 
			$id = $json[$i]['id'];
			$sql = 'SELECT * FROM maps WHERE island='.$id;

			$result = mysqli_query($con,$sql);
			$maps = mysqli_fetch_all($result,MYSQLI_ASSOC);

			$json[$i]['maps'] = $maps;

			//read the maps
			// for ($k=0; $k < count($json[$i]['maps']); $k++) { 
			// 	$file = fopen('../maps/'.$json[$i]['maps'][$k]['url'], "r") or die("Unable to open file!");

			// 	$json[$i]['maps'][$k]['data'] = fread($file,filesize('../maps/'.$json[$i]['maps'][$k]['url']));
			// 	fclose($file);
			// }
		}

		mysqli_close($con);
	}

	$json = json_encode($json);
	echo($json);
?>