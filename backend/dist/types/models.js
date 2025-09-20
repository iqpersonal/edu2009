"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Term = exports.AssessmentType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["SCHOOL_ADMIN"] = "SCHOOL_ADMIN";
    UserRole["ACADEMIC_DIRECTOR"] = "ACADEMIC_DIRECTOR";
    UserRole["HEAD_OF_SECTION"] = "HEAD_OF_SECTION";
    UserRole["SUBJECT_COORDINATOR"] = "SUBJECT_COORDINATOR";
    UserRole["TEACHER"] = "TEACHER";
    UserRole["STUDENT"] = "STUDENT";
    UserRole["PARENT"] = "PARENT";
})(UserRole || (exports.UserRole = UserRole = {}));
var AssessmentType;
(function (AssessmentType) {
    AssessmentType["QUIZ"] = "QUIZ";
    AssessmentType["TEST"] = "TEST";
    AssessmentType["EXAM"] = "EXAM";
    AssessmentType["ASSIGNMENT"] = "ASSIGNMENT";
    AssessmentType["PROJECT"] = "PROJECT";
    AssessmentType["HOMEWORK"] = "HOMEWORK";
})(AssessmentType || (exports.AssessmentType = AssessmentType = {}));
var Term;
(function (Term) {
    Term["FIRST"] = "FIRST";
    Term["SECOND"] = "SECOND";
    Term["THIRD"] = "THIRD";
    Term["SUMMER"] = "SUMMER";
})(Term || (exports.Term = Term = {}));
//# sourceMappingURL=models.js.map