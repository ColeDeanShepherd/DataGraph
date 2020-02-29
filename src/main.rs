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

fn todo_main() -> Result<(), Box<dyn Error>> {
    let mut state = State::new();

    state.add_todo(String::from("todo 1"), false);
    state.add_todo(String::from("todo 2"), true);
    state.add_todo(String::from("todo 3"), true);

    state.complete_todo(1)?;
    state.uncomplete_todo(2)?;

    let x = state.remove_todo(3);

    println!("{:?}", state);
    println!("{:?}", x);

    Ok(())
}

// Yew example app
use yew::{html, Callback, ClickEvent, Component, ComponentLink, Html, ShouldRender};

struct App {
    clicked: bool,
    onclick: Callback<ClickEvent>,
}

enum Msg {
    Click,
}

impl Component for App {
    type Message = Msg;
    type Properties = ();

    fn create(_: Self::Properties, link: ComponentLink<Self>) -> Self {
        App {
            clicked: false,
            onclick: link.callback(|_| Msg::Click),
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Click => {
                self.clicked = true;
                true // Indicate that the Component should re-render
            }
        }
    }

    fn view(&self) -> Html {
        let button_text = if self.clicked { "Clicked!" } else { "Click me!" };

        html! {
            <button onclick=&self.onclick>{ button_text }</button>
        }
    }
}

fn yew_main() {
    yew::start_app::<App>();
}




// Actual main
fn main() {
    yew_main();
}