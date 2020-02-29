// To-Do backend app

use std::iter::Iterator;
use std::error::Error;

mod vec_ext;
use vec_ext::VecExt;

#[derive(Debug)]
struct State {
    todos: Vec<ToDo>,
    next_id: u64,
}

impl State {
    fn new() -> State {
        State {
            todos: Vec::new(),
            next_id: 1,
        }
    }
}

#[derive(Debug)]
struct ToDo {
    id: u64,
    description: String,
    done: bool,
}

impl Clone for ToDo {
    fn clone(&self) -> Self {
        ToDo { id: self.id, description: self.description.clone(), done: self.done }
    }
}

impl State {
    pub fn add_todo(&mut self, description: String, done: bool) {
        self.todos.push(ToDo {
            id: self.next_id,
            description: description,
            done: done,
        });
        self.next_id += 1;
    }
    pub fn remove_todo(&mut self, id: u64) -> Option<ToDo> {
        self.todos.remove_first(|t| t.id == id)
    }
    pub fn complete_todo(&mut self, id: u64) -> Result<(), &str> {
        let todo = self.todos.iter_mut().find(|t| t.id == id);
        match todo {
            Some(t) => {
                t.done = true;
                Ok(())
            }
            None => Err("Nonexistent todo"),
        }
    }
    pub fn uncomplete_todo(&mut self, id: u64) -> Result<(), &str> {
        let todo = self.todos.iter_mut().find(|t| t.id == id);
        match todo {
            Some(t) => {
                t.done = false;
                Ok(())
            }
            None => Err("Nonexistent todo"),
        }
    }
}

// Yew example app
use yew::prelude::*;

struct Model {
    link: ComponentLink<Self>,
    props: ModelProps
}

#[derive(Properties)]
struct ModelProps {
    #[props(required)]
    todos: Vec<ToDo>
}

impl Clone for ModelProps {
    fn clone(&self) -> Self {
        ModelProps { todos: self.todos.clone() }
    }
}

enum Msg {}

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
            <table>
                <thead>
                    <tr>
                        <th>{ "ID" }</th>
                        <th>{ "Description" }</th>
                        <th>{ "Done" }</th>
                    </tr>
                </thead>

                <tbody>
                    { for self.props.todos.iter().map(render_todo) }
                </tbody>
            </table>
        }
    }
}

fn render_todo(todo: &ToDo) -> Html {
    html! {
        <tr>
            <td><input type="text" value=todo.id /></td>
            <td><input type="text" value=todo.description /></td>
            <td><input type="text" value=todo.done /></td>
        </tr>
    }
}

fn yew_main() -> Result<(), Box<dyn Error>> {
    let mut state = State::new();

    state.add_todo(String::from("todo 1"), false);
    state.add_todo(String::from("todo 2"), true);
    state.add_todo(String::from("todo 3"), true);

    state.complete_todo(1)?;
    state.uncomplete_todo(2)?;

    let x = state.remove_todo(3);

    println!("{:?}", state);
    println!("{:?}", x);

    yew::start_app_with_props::<Model>(ModelProps { todos: state.todos.clone() });
    
    Ok(())
}




// Actual main
fn main() {
    yew_main().unwrap();
}