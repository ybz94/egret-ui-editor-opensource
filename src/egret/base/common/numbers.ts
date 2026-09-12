
'use strict';

/**
 * 算术表达式允许出现的字符白名单：数字、加减乘除、括号、小数点与空白
 */
const ARITHMETIC_CHARS_REG = /^[\d\s+\-*/().]+$/;
/**
 * 算术表达式的特征字符，文本中出现任意一个即按表达式处理
 */
const ARITHMETIC_OPERATOR_REG = /[+\-*/()]/;

/**
 * @description 判断文本是否为算术表达式的输入态（如 "50/2"、"(3+" 等中间态或完成态）
 * @param text 输入文本
 */
export function isArithmeticExpression(text: string): boolean {
	return ARITHMETIC_OPERATOR_REG.test(text) && ARITHMETIC_CHARS_REG.test(text);
}

/**
 * @description 对四则运算表达式求值，支持加减乘除、括号与一元正负号；文本非法或无法求值时返回 NaN
 * @param text 表达式文本，如 "(50+10)/2"
 */
export function evalArithmetic(text: string): number {
	if (!isArithmeticExpression(text)) {
		return NaN;
	}
	//去掉空白，规整为连续字符流
	const chars = text.replace(/\s+/g, '');
	let pos = 0;
	const peek = (): string => chars.charAt(pos);
	const eat = (expected: string): boolean => {
		if (peek() === expected) {
			pos++;
			return true;
		}
		return false;
	};
	//消耗一个数字字面量
	const eatNumber = (): number => {
		const start = pos;
		while (pos < chars.length && /[\d.]/.test(chars.charAt(pos))) {
			pos++;
		}
		const value = parseFloat(chars.slice(start, pos));
		if (start === pos || isNaN(value)) {
			throw new Error('invalid number');
		}
		return value;
	};
	//atom := 数字 | '(' expr ')'
	const parseAtom = (): number => {
		if (eat('(')) {
			const value = parseExpr();
			if (!eat(')')) {
				throw new Error('unbalanced parenthesis');
			}
			return value;
		}
		return eatNumber();
	};
	//factor := ('+'|'-') factor | atom
	const parseFactor = (): number => {
		if (eat('+')) {
			return parseFactor();
		}
		if (eat('-')) {
			return -parseFactor();
		}
		return parseAtom();
	};
	//term := factor (('*'|'/') factor)*
	const parseTerm = (): number => {
		let value = parseFactor();
		while (peek() === '*' || peek() === '/') {
			const op = peek();
			pos++;
			const rhs = parseFactor();
			if (op === '*') {
				value *= rhs;
			} else {
				value /= rhs;
			}
		}
		return value;
	};
	//expr := term (('+'|'-') term)*
	const parseExpr = (): number => {
		let value = parseTerm();
		while (peek() === '+' || peek() === '-') {
			const op = peek();
			pos++;
			const rhs = parseTerm();
			if (op === '+') {
				value += rhs;
			} else {
				value -= rhs;
			}
		}
		return value;
	};
	try {
		const value = parseExpr();
		//表达式必须被完整消耗，且结果必须是有限数（排除除零得到的 Infinity）
		if (pos !== chars.length || !isFinite(value)) {
			return NaN;
		}
		return value;
	} catch (e) {
		return NaN;
	}
}

/**
 * @description 判断点是否在矩形范围内
 * @param x 点x坐标
 * @param y 点y坐标
 * @param rectX 矩形左下x坐标
 * @param rectY 矩形左下y坐标
 * @param width 矩形宽度
 * @param height 矩形高度
 */
export function pointInRect(x: number, y: number, rectX: number, rectY: number, width: number, height: number): boolean {
	return ((x >= rectX) && (x <= (rectX + width)) && (y <= rectY) && (y >= (rectY - height)));
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function rot(index: number, modulo: number): number {
	return (modulo + (index % modulo)) % modulo;
}

export function sin(value: number): number {
	const valueFloor = Math.floor(value);
	const valueCeil = valueFloor + 1;
	const resultFloor = sinInt(valueFloor);
	if (valueFloor == value) {
		return resultFloor;
	}
	const resultCeil = sinInt(valueCeil);
	return (value - valueFloor) * resultCeil + (valueCeil - value) * resultFloor;
}
export function sinInt(value: number): number {
	value = value % 360;
	if (value < 0) {
		value += 360;
	}
	return Math.sin(value);
}
export function cos(value: number): number {
	const valueFloor = Math.floor(value);
	const valueCeil = valueFloor + 1;
	const resultFloor = cosInt(valueFloor);
	if (valueFloor == value) {
		return resultFloor;
	}
	const resultCeil = cosInt(valueCeil);
	return (value - valueFloor) * resultCeil + (valueCeil - value) * resultFloor;
}
export function cosInt(value: number): number {
	value = value % 360;
	if (value < 0) {
		value += 360;
	}
	return Math.cos(value);
}