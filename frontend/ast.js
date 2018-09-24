function getSubAsts (node) {
	//get all the keys that map to an AST
	const keydDescendants = Object.keys(node)
		.filter(key => typeof node[key] === 'object'
			&& typeof node[key]['operation'] === "string") || [];
	//get all keys that map to a list of ASTs
	const listedDescendants = Object.keys(node)
		.filter(key => Array.isArray(node[key])
			&& node[key].length > 0
			&& typeof node[key][0]['operation'] === "string");

	return keydDescendants.concat(listedDescendants);

}

module.exports = {
	build: function (node) {
		const descendants = getSubAsts(node);
		return descendants.length === 0
			? node
			: Object.assign(node, {
				subAsts: getSubAsts(node)
			});
	},
	traverse: function (ast, visitor) {
    const stack = [ast];
    
  }
}
