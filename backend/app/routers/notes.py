from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..database import get_db
from ..models import Note
from ..schemas import NoteCreate, NoteUpdate, Note as NoteSchema

router = APIRouter()

@router.post("/", response_model=NoteSchema)
async def create_note(note: NoteCreate, db: AsyncSession = Depends(get_db)):
    db_note = Note(**note.model_dump())
    db.add(db_note)
    await db.commit()
    await db.refresh(db_note)
    return db_note

@router.get("/", response_model=List[NoteSchema])
async def read_notes(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).offset(skip).limit(limit).order_by(Note.created_at.desc()))
    return result.scalars().all()

@router.get("/{note_id}", response_model=NoteSchema)
async def read_note(note_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).filter(Note.id == note_id))
    note = result.scalars().first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.delete("/{note_id}")
async def delete_note(note_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).filter(Note.id == note_id))
    note = result.scalars().first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    await db.delete(note)
    await db.commit()
    return {"ok": True}

@router.put("/{note_id}", response_model=NoteSchema)
async def update_note(note_id: int, note_update: NoteUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).filter(Note.id == note_id))
    db_note = result.scalars().first()
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    update_data = note_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)
    
    await db.commit()
    await db.refresh(db_note)
    return db_note
