const path = require("path");
const fs = require("fs");
const Ajv = require("ajv")

const assert = require("../../../modules/console/assert.js"); 
const WorkspacePath = require("../../../modules/workspace/workspace-path.js");
const TestEnv = require("../../../modules/integration-test/test-env.js");


class TestCasesConfig {

    static getConfig(configPathList) {
        return new Promise((resolve, reject) => {
            const ajv = new Ajv()
            let configsReady = [];
            let configs = {suites: [], tests: {}};
            assert(Array.isArray(configPathList), "configPathList is array");
            configPathList.forEach((configPath, index) => {
                configPathList[index] = WorkspacePath.resolvePath(configPath, TestEnv.getWorkspacePath(), TestEnv.getTestSuitePath());
                let configReady = new Promise((resolve, reject) => {
                    TestCasesConfig.readConfig(configPathList[index]).then(config => {
                        const validate = ajv.compile(TestCasesConfig.getConfigSchema());
                        assert(validate(config), "config schema validation failed");
                        let suite = {
                            suite: path.join(TestEnv.getWorkspacePath(), config.data.suite),
                            config: config.path,
                            tests: {}
                        };
                        Object.keys(config.data.test).forEach(testCase => {
                            let testCaseId = path.join(config.data.suite, testCase);
                            let testCaseData = config.data.test[testCase];
                            suite.tests[testCaseId] = testCaseData;
                            configs.tests[testCaseId] = testCaseData;
                        });
                        configs.suites.push(suite);
                        return resolve();
                    }).catch(err => {
                        return reject(err);
                    });                    
                });
                configsReady.push(configReady);
            });
            Promise.all(configsReady).then(() => {
                return resolve(configs);
            }).catch(err => {
                return reject(err);
            });
        });
    }


    static readConfig(configPath) {
        return new Promise((resolve, reject) => {
            fs.stat(configPath, err => {
                if (err === null) {
                    fs.readFile(configPath, (err, data) => {
                        if (err) {
                            return reject(err);
                        }
                        try {
                            data = JSON.parse(data);
                        } catch (err) {
                            return reject(err);
                        }
                        return resolve({path: configPath, data: data});
                    });
                } else {
                    return reject(err);
                }
            });
        });
    }


    static getConfigSchema() {
        return {
            type: "object",
            properties: {
                path: {
                    type: "string"
                },
                data: {
                    type: "object",
                    properties: {
                        suite: {
                            type: "string"
                        },
                        test: {
                            type: "object",
                            additionalProperties: {
                                type: "object",
                                properties: {
                                    refs: {
                                        type: "array"
                                    },
                                    animstep: {
                                        type: "string"
                                    }
                                },
                                additionalProperties: false
                            }
                        }
                    },
                    required: ["suite"],
                    additionalProperties: false
                }
            },
            required: ["path", "data"],
            additionalProperties: false
        };
    }
}


module.exports = TestCasesConfig;
