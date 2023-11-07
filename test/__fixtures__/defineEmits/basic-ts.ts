export interface Events {
	(event: "foo"): void;
	(event: 1 extends 2 ? "bar" : "baz"): void;
}
