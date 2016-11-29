var xlsx = require('xlsx');
var fs = require('fs');
// 读取excel文件
var book = xlsx.readFileSync('./数据表汇总.xlsx');

book.SheetNames.forEach(function(name) {
	// 根据列表名称，读取每个列表中的信息
	var sheet = book.Sheets[name];
	var range = sheet['!ref'];
	if (range) {
		json = xlsx.utils.sheet_to_json(sheet);
		fs.writeFile(name+'.json', JSON.stringify(json), function(err) {
			if (err) {
				return console.error(err);
			}
		});
	}
});

console.log('操作完成');
