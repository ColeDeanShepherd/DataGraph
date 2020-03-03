use std::prelude::v1::*;
use std::error::Error;
use yew::prelude::*;

use crate::logic::*;

pub struct Model {
    link: ComponentLink<Self>,
    props: ModelProps
}

#[derive(Clone, Properties)]
pub struct ModelProps {
    #[props(required)]
    state: State
}

pub enum Msg {}

impl Component for Model {
    type Message = Msg;
    type Properties = ModelProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Model { link, props }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        true
    }

    fn view(&self) -> Html {
        html! {
            <>
                <table>
                    <thead>
                        <tr>
                            <th>{ "ID" }</th>
                            <th>{ "Description" }</th>
                            <th>{ "Done" }</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        { for self.props.state.todos.iter().map(render_todo) }
                    </tbody>
                </table>
                <button>{ "+" }</button>
            </>
        }
    }
}

fn render_todo(todo: &ToDo) -> Html {
    html! {
        <tr>
            <td><input type="text" value=todo.id /></td>
            <td><input type="text" value=todo.description /></td>
            <td><input type="text" value=todo.done /></td>
            <td><button>{ "-" }</button></td>
        </tr>
    }
}

pub fn yew_main() -> Result<(), Box<dyn Error>> {
    let mut state = State::new();

    state.add_todo(String::from("todo 1"), false);
    state.add_todo(String::from("todo 2"), true);
    state.add_todo(String::from("todo 3"), true);

    state.complete_todo(1)?;
    state.uncomplete_todo(2)?;

    let x = state.remove_todo(3);

    println!("{:?}", state);
    println!("{:?}", x);

    yew::start_app_with_props::<Model>(ModelProps { state: state });
    
    Ok(())
}