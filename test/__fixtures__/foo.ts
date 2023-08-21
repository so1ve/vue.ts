export interface A {
	foo: B;
	bar: C;
	baz: D;
}

interface B {}
type C = number extends boolean ? string : number;
interface D {
	aaa: 1;
}
