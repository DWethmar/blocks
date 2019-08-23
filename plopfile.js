module.exports = function(plop) {
    // controller generator
    plop.setGenerator('behaviour', {
        description: 'add game behaviour',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'Behaviour name please',
            },
        ],
        actions: [
            {
                type: 'add',
                path:
                    'src/game/behaviour/{{kebabCase name}}/{{kebabCase name}}.js',
                templateFile: 'plop-templates/behavior-component.ts.hbs',
            },
        ],
        actions: [
            {
                type: 'add',
                path:
                    'src/game/behaviour/{{kebabCase name}}/{{kebabCase name}}.js',
                templateFile: 'plop-templates/behavior-component.ts.hbs',
            },
        ],
    });
};
