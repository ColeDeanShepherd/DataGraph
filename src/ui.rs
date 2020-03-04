use std::prelude::v1::*;
use std::error::Error;

use serde_json;

use yew::prelude::*;

use crate::logic::*;

pub struct Model {
    link: ComponentLink<Self>,
    props: ModelProps,
    add_todo: Callback<ClickEvent>
}

#[derive(Clone, Properties)]
pub struct ModelProps {
    #[props(required)]
    state: State
}

pub enum Msg {
    AddTodo,
    RemoveTodo { id: u64 },
    ChangeDescription { id: u64, new_value: String },
    ChangeDone { id: u64, new_value: bool }
}

impl Component for Model {
    type Message = Msg;
    type Properties = ModelProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Model {
            props,
            add_todo: link.callback(|_| Msg::AddTodo),
            link
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::AddTodo => {
                self.props.state.add_todo(String::from(""), false);
                true
            },
            Msg::RemoveTodo { id } => {
                self.props.state.remove_todo(id);
                true
            },
            Msg::ChangeDescription { id, new_value } => {
                self.props.state.set_todo_description(id, new_value).unwrap();
                true
            },
            Msg::ChangeDone { id, new_value } => {
                self.props.state.set_todo_done(id, new_value).unwrap();
                true
            }
        }

    }

    fn view(&self) -> Html {
        let serialized_state = serde_json::to_string(&self.props.state).unwrap();

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
                        { for self.props.state.todos.iter().map(|todo| self.render_todo(todo)) }
                    </tbody>
                </table>
                <button onclick=&self.add_todo>{ "+" }</button>
                <br />
                <textarea value=serialized_state></textarea>
            </>
        }
    }
}

impl Model {
    fn render_todo(&self, todo: &ToDo) -> Html {
        let id = todo.id;
        let done = todo.done;

        let change_description = self.link.callback(move |e: InputData| Msg::ChangeDescription { id: id, new_value: e.value });
        let toggle_done = self.link.callback(move |_| Msg::ChangeDone { id: id, new_value: !done });
        let remove_todo = self.link.callback(move |_| Msg::RemoveTodo { id: id });

        html! {
            <tr>
                <td><input type="text" value=todo.id disabled=true /></td>
                <td><input type="text" value=todo.description oninput=change_description /></td>
                <td><input type="checkbox" checked=done onclick=toggle_done /></td>
                <td><button onclick=remove_todo>{ "-" }</button></td>
            </tr>
        }
    }
}

pub fn yew_main() -> Result<(), Box<dyn Error>> {
    let mut state = State::new();

    state.add_todo(String::from("todo 1"), false);
    state.add_todo(String::from("todo 2"), true);
    state.add_todo(String::from("todo 3"), true);

    state.set_todo_done(1, true)?;
    state.set_todo_done(2, false)?;

    let x = state.remove_todo(3);

    println!("{:?}", state);
    println!("{:?}", x);

    yew::start_app_with_props::<Model>(ModelProps { state: state });
    
    Ok(())
}