use crate::vec_ext::*;

#[derive(Debug)]
pub struct State {
    pub todos: Vec<ToDo>,
    next_id: u64,
}

impl State {
    pub fn new() -> State {
        State {
            todos: Vec::new(),
            next_id: 1,
        }
    }
}

#[derive(Debug)]
pub struct ToDo {
    pub id: u64,
    pub description: String,
    pub done: bool,
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