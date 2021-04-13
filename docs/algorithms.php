<?php
	require 'SimpleXLSX.php';
	if ($xlsx = SimpleXLSX::parse('../algorithms/algorithms.xlsx')) {
		$r = $xlsx->rows();
		$list = [];
		for ($i = 1; $i < count($r); $i++) {
			$arr = ['id' => $i];
			foreach ($r[0] as $h => $header) {
				$arr[$header] = $r[$i][$h];
			}
			$list[] = $arr;
		}
	} else {
		echo SimpleXLSX::parseError();
		exit;
} ?><!DOCTYPE html>
<html>
	<head>
		<title></title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width">
		<link rel="stylesheet" type="text/css" href="/rubiks_full/css/bootstrap.min.css">
		<style>
			img { max-width: 100%; }
		</style>
	</head>
	<body>
		<div class="container">
			<?php $currentGroup = ''; ?>
			<?php $currentSection = ''; ?>

			<?php foreach ($list as $data) { ?>

				<?php if(!isset($_GET['group']) || $_GET['group'] == $data['Group']){ ?>
					
					<?php if($currentGroup != $data['Group']){
						$currentGroup = $data['Group'];
						echo '<h1>'.$currentGroup.'</h1>';
					} ?>
					<?php if($currentSection != $data['Section']){
						$currentSection = $data['Section'];
						echo '<h2>'.$currentSection.'</h2>';
					} ?>

					<div class="row">
						<div class="col-sm-4 col-lg-3">
							<img src="https://ps.normalux.ch/visualcube/?fmt=svg&case=<?=str_replace(' ', '', $data['Algorithm'])?>&stage=<?=$data['Stage']?>" />
						</div>
						<div class="col-sm-8 col-lg-9">
							<h3><?=$data['Name']?></h3>
							<p><strong><?=$data['Algorithm']?></strong></p>
							<p><strong>Quand ? :</strong> <?=$data['When']?></p>
							<p><strong>Méthode :</strong> <?=$data['Method']?></p>
							<p><?=$data['Method_full']?></p>
						</div>
					</div>
					<hr>
				<?php } ?>
			<?php } ?>
		</div>
	</body>
</html>
