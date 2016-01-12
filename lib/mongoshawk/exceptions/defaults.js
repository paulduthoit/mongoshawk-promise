module.exports = {

	// Validation exceptions
	ValidationException: {
		ValidationFailed: {
			message: "The provided data are invalid",
			code: 100
		},
		NotAString: {
			message: "Must be a string",
			code: 2001
		},
		NotMatchRegex: {
			messageBeforeRegex: "Must match the following regex : ",
			messageAfterRegex: "",
			code: 2002
		},
		NotAnEmail: {
			message: "Must be a valid email address",
			code: 2003
		},
		NotAlpha: {
			message: "Must contain only letters",
			code: 2004
		},
		NotAlphaNumeric: {
			message: "Must contain only letters and numbers",
			code: 2005
		},
		NotAlphaNumericDashUnderscore: {
			message: "Must contain only letters, numbers, dash and underscore",
			code: 2006
		},
		NotBetweenMinMax: {
			messageBeforeMin: "Must contain between ",
			messageBetween: " and ",
			messageAfterMax: " character(s)",
			code: 2007
		},
		NotAboveMin: {
			messageBeforeMin: "Must contain minimum ",
			messageAfterMin: " character(s)",
			code: 2008
		},
		NotBelowMax: {
			messageBeforeMax: "Must contain maximum ",
			messageAfterMax: " character(s)",
			code: 2009
		},
		NotInList: {
			messageBeforeList: "Must be ",
			messageAfterList: "",
			listSeparator: ", ",
			lastListSeparator: " or ",
			code: 2010
		},
		NotAnIPv4: {
			message: "Must be a valid ipv4 address",
			code: 2011
		},
		NotAnIPv6: {
			message: "Must be a valid ipv6 address",
			code: 2012
		},
		NotAnIP: {
			message: "Must be a valid ipv4 or ipv6 address",
			code: 2013
		},
		NotAnUrl: {
			message: "Must be a valid url",
			code: 2014
		},
		NotANumber: {
			message: "Must be a number",
			code: 2015
		},
		NotEqual: {
			messageBeforeNumber: "Must be equal to ",
			messageAfterNumber: "",
			code: 2016
		},
		NotDifferent: {
			messageBeforeNumber: "Must be different from ",
			messageAfterNumber: "",
			code: 2017
		},
		NotLowerEqual: {
			messageBeforeNumber: "Must be lower or equal to ",
			messageAfterNumber: "",
			code: 2018
		},
		NotLower: {
			messageBeforeNumber: "Must be lower than ",
			messageAfterNumber: "",
			code: 2019
		},
		NotUpperEqual: {
			messageBeforeNumber: "Must be upper or equal to ",
			messageAfterNumber: "",
			code: 2020
		},
		NotUpper: {
			messageBeforeNumber: "Must be upper than ",
			messageAfterNumber: "",
			code: 2021
		},
		NotInRange: {
			messageBeforeMin: "Must be between ",
			messageBetween: " and ",
			messageAfterMax: "",
			code: 2022
		},
		NotSame: {
			messageBeforeTest: "Must be equal to the following element : ",
			messageAfterTest: "",
			code: 2023
		},
		NotStrictSame: {
			messageBeforeTest: "Must be strictly equal to the following element : ",
			messageAfterTest: "",
			code: 2024
		},
		Empty: {
			message: "Must be non empty",
			code: 2025
		}
	},

};