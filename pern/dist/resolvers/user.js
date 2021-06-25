"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const User_1 = require("../entities/User");
const type_graphql_1 = require("type-graphql");
const argon2_1 = require("argon2");
let UsernamePasswordFields = class UsernamePasswordFields {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UsernamePasswordFields.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], UsernamePasswordFields.prototype, "password", void 0);
UsernamePasswordFields = __decorate([
    type_graphql_1.InputType()
], UsernamePasswordFields);
let FieldError = class FieldError {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    type_graphql_1.ObjectType()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    type_graphql_1.Field(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    type_graphql_1.ObjectType()
], UserResponse);
let UserResolver = class UserResolver {
    me({ req, em }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return null;
            }
            const user = yield em.findOne(User_1.User, { id: req.session.userId });
            return user;
        });
    }
    register({ em, req }, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = options;
            const hashedPassword = yield argon2_1.hash(password);
            if (username.length <= 2) {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username length must be greater 2",
                        },
                    ],
                };
            }
            if (password.length <= 2) {
                return {
                    errors: [
                        {
                            field: "password",
                            message: "password length must be greater 2",
                        },
                    ],
                };
            }
            const user = em.create(User_1.User, { username, password: hashedPassword });
            try {
                yield em.persistAndFlush(user);
            }
            catch (error) {
                if (error.code === "23505") {
                    return {
                        errors: [
                            {
                                field: "username",
                                message: "already taken",
                            },
                        ],
                    };
                }
            }
            req.session.userId = user.id;
            return { user };
        });
    }
    updateUser({ em }, id, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield em.findOne(User_1.User, { id });
            if (!user)
                return null;
            if (password) {
                user.password = password;
                em.persistAndFlush(user);
            }
            return user;
        });
    }
    deleteUser({ em }, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield em.findOne(User_1.User, { id });
            if (user) {
                em.nativeDelete(User_1.User, { id });
                return true;
            }
            return false;
        });
    }
    users({ em }) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield em.find(User_1.User, {});
            return users;
        });
    }
    user({ em }, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield em.findOne(User_1.User, { id });
            if (!user) {
                return null;
            }
            return user;
        });
    }
    login({ em, req }, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield em.findOne(User_1.User, { username: options.username });
            if (!user) {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "Username doesn't exist!",
                        },
                    ],
                };
            }
            const isValid = yield argon2_1.verify(user.password, options.password);
            if (!isValid) {
                return {
                    errors: [
                        {
                            field: "password",
                            message: "incorrect password",
                        },
                    ],
                };
            }
            req.session.userId = user.id;
            return { user };
        });
    }
};
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UsernamePasswordFields]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("id")),
    __param(2, type_graphql_1.Arg("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUser", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteUser", null);
__decorate([
    type_graphql_1.Query(() => [User_1.User]),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "users", null);
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "user", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UsernamePasswordFields]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
UserResolver = __decorate([
    type_graphql_1.Resolver()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map