module.exports = {
	parser: 'babel-eslint',
	root: true,
	rules: {
		'prefer-const': [ 2, {
			'destructuring': 'all',
			'ignoreReadBeforeAssign': false
		} ],
		'no-const-assign': [ 2 ],
		'no-var': [ 2 ],
		'no-new-object': [ 2 ],
		'no-array-constructor': [ 2 ],
		'prefer-destructuring': [ 2, { 'object': true } ],
		'quotes': [ 1, 'single' ],
		'prefer-template': [ 1 ],
		'no-eval': [ 2 ],
		'prefer-rest-params': [ 2 ],
		'space-before-blocks': [ 1, 'always' ],
		'space-before-function-paren': [ 1, 'always' ],
		'no-param-reassign': [ 2 ],
		'prefer-spread': [ 2 ],
		'prefer-arrow-callback': [ 2 ],
		'no-useless-constructor': [ 2 ],
		'no-dupe-class-members': [ 2 ],
		'no-duplicate-imports': [ 2 ],
		'object-curly-newline': [ 2, { 
			'multiline': true, 'minProperties': 5
		} ],
		'dot-notation': [ 2 ],
		'max-len': [ 1, 120 ],
		'eqeqeq': [ 2, 'always' ],
		'spaced-comment': [ 2, 'always' ],
		'array-bracket-spacing': [ 2, 'always' ],
		'object-curly-spacing': [ 2, 'always' ],
		'semi': [ 2, 'always' ],
	}
};
