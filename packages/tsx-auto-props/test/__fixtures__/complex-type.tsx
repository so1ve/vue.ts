import { defineComponent } from "vue";

type Props = 1 extends 1
	? {
			foo: number;
		}
	: { a: string };

const Foo = defineComponent((props: Props) => () => <div>{props}</div>);
