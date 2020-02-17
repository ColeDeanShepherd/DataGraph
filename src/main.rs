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

fn main() -> Result<(), Box<dyn Error>> {
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
