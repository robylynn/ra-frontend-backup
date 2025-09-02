OPC-UA Database Schema
This schema is designed to store OPC-UA node metadata and the associated time-series data. It is an adaptation of the previous schema, with key fields to handle OPC-UA specific concepts like NodeId and detailed status information.

opcua_nodes Table
This table stores the metadata for each OPC-UA node. The primary key is a combination of namespace_index and node_id to ensure global uniqueness.

CREATE TABLE opcua_nodes (
    namespace_index INT NOT NULL,
    node_id VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    data_type VARCHAR(50),
    unit VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (namespace_index, node_id)
);

COMMENT ON TABLE opcua_nodes IS 'Stores metadata for each OPC-UA node.';
COMMENT ON COLUMN opcua_nodes.namespace_index IS 'The namespace index of the node, part of its unique identifier.';
COMMENT ON COLUMN opcua_nodes.node_id IS 'The string or numeric identifier of the node within its namespace.';
COMMENT ON COLUMN opcua_nodes.display_name IS 'The human-readable name of the node.';
COMMENT ON COLUMN opcua_nodes.description IS 'A brief description of the node.';
COMMENT ON COLUMN opcua_nodes.data_type IS 'The OPC-UA data type (e.g., "Float", "Integer", "String").';
COMMENT ON COLUMN opcua_nodes.unit IS 'The engineering unit of the node value.';

opcua_data Table
This table stores the time-series data. The value field is a TEXT type to accommodate a wide range of OPC-UA data types, including strings, booleans, and more complex structures. Both server and source timestamps are included for precision.

CREATE TABLE opcua_data (
    data_id BIGSERIAL PRIMARY KEY,
    namespace_index INT NOT NULL,
    node_id VARCHAR(255) NOT NULL,
    value TEXT,
    source_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    server_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    status_code INT NOT NULL,
    CONSTRAINT fk_node
        FOREIGN KEY (namespace_index, node_id)
        REFERENCES opcua_nodes(namespace_index, node_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_opcua_data_node_id_timestamp ON opcua_data (namespace_index, node_id, source_timestamp);
CREATE INDEX idx_opcua_data_server_timestamp ON opcua_data (server_timestamp);

COMMENT ON TABLE opcua_data IS 'Stores time-series data for each OPC-UA node.';
COMMENT ON COLUMN opcua_data.data_id IS 'Unique identifier for each data point.';
COMMENT ON COLUMN opcua_data.namespace_index IS 'Foreign key part linking to the opcua_nodes table.';
COMMENT ON COLUMN opcua_data.node_id IS 'Foreign key part linking to the opcua_nodes table.';
COMMENT ON COLUMN opcua_data.value IS 'The value of the data point, stored as TEXT to handle various data types.';
COMMENT ON COLUMN opcua_data.source_timestamp IS 'The timestamp from the source device or application.';
COMMENT ON COLUMN opcua_data.server_timestamp IS 'The timestamp from the OPC-UA server.';
COMMENT ON COLUMN opcua_data.status_code IS 'The numeric status code of the data point (e.g., Good, Bad).';
