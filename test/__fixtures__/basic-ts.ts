export interface SomeInterface {
	emptyInterface: B;
	conditionalNumber: C;
	interface: D;
}

interface B {}
type C = number extends boolean ? string : number;
interface D {
	aaa: 1;
}
