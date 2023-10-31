export interface SomeInterface {
	emptyInterface: EmptyInterface;
	conditionalNumber: ConditionalNumber;
	interface: Interface;
	typeLiteral: TypeLiteral;
}

interface EmptyInterface {}
type ConditionalNumber = number extends boolean ? string : number;
interface Interface {
	aaa: 1;
}
type TypeLiteral = {
	foo: ConditionalNumber;
};
interface InterfaceExtends extends Interface {}
