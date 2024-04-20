class SpreadSheetCellsChannel < ApplicationCable::Channel
  include NoBrainer::Streams

  def subscribed
    stream_from SpreadsheetCell.all, include_initial: true
  end

  def set_cell_value(message)
    cell = SpreadsheetCell.where(location: message['location']).first

    if cell
      cell.update! value: message['value']
    else
      SpreadsheetCell.create(location: message['location'], value: message['value'])
    end
  end
end