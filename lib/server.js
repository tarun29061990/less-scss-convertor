var fs = require("fs"),
	path = require("path"),
	chmodrSync = require("chmodr");

console.log("Starting");
function convertThis(){
	if(process.argv.length>2&&process.argv[2]!==null){
		var argArr = process.argv[2].split(",");
		argArr.forEach(function(dataSource){
			dataSource = dataSource.trim();
			dataSourceType = fs.lstatSync(dataSource),
			list =[],
			newDir = "";
		
			if(dataSourceType.isDirectory()){
				newDir = dataSource+'/scss/';
				list = (fs.readdirSync(dataSource));
				init(dataSource,newDir,list);
			}else if(dataSourceType.isFile()){
				var fileDirectory = path.dirname(dataSource),
					newDir = fileDirectory+'/scss/';
					list.push(dataSource);
				
				init(fileDirectory,newDir,list);
			}else{
				console.log("Bad Input");
			}
		});
	}else{
		console.log("No file entered");
	}
}
function init(oldDir,newDir,list){
	fs.exists(newDir, function (exists) {

	   	exists ? '':fs.mkdirSync(newDir);
	   	chmodrSync(newDir,0777);
	   	if(list.length >1){
	   		list.forEach(function(file){
				if(file!=='.DS_Store'){
				    var filePath = oldDir.slice(0,oldDir.length)+'/'+file,
						content = fs.readFileSync(filePath,"utf8");
					regexMatchingAndReplacing(newDir,content,filePath);	
				}
			});	
	   	}else{
	   		var filePath = list[0];
	   			content = fs.readFileSync(filePath,"utf8");
	   			regexMatchingAndReplacing(newDir,content,filePath);	
	   	}
	   	
	});
}
function regexMatchingAndReplacing(newDir,content,file){
	var data = 	content.replace(/@(?!media|include)/g,"$").replace(/([.][\w\-_]+);/g,"@extend $1")
				.replace(/(@include\W+)[.#]([^(;]*\()/g,"$1$2").replace(/[.]([^\0-9][\-\w+\(;,$ %#)]*\;)/g,"@include $1")
				.replace(/[.](\w*\-*\w*\([\-\w\# ,.$\(*\)*]*\)\;)/g,"@include $1")
				.replace(/[.]([^(;.:]*\([$&]*)/g,"@mixin $1").replace(/(\$[^\W]*[ ]*)(=)/g,"$1:")
				.replace(/Microsoft@mixin /g,"Microsoft.").replace(/filter: ~/g,"filter: ").replace(/&@mixin /g,"&.")
				.replace(/@mixin (\ *\w*\-*\w*\ *\{)/g,".$1").replace(/@include (png|jpg|jpeg|txt|gif)/g,".$1")
				.replace(/@extend ([.]\w)/g,"$1;");
	makeFile(newDir,data,file);
}
function makeFile(newDir,contentText,file){
	var fileName = path.basename(file);
	var scssContent = contentText;
	var newDir = newDir+fileName.split(".")[0]+".scss";
	fs.writeFileSync(newDir,scssContent);
	console.log("finished writing to "+newDir);
}
exports.convert = convertThis;