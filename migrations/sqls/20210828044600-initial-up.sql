create table if not exists events
(
    id serial not null
        constraint events_pk
            primary key,
    timestamp timestamp without time zone default current_timestamp,
    node int,
    "commandClass" int,
    endpoint int,
    property jsonb,
    "prevValue" jsonb,
    "newValue" jsonb
);

